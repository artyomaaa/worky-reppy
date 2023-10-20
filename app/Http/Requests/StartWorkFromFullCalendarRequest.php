<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartWorkFromFullCalendarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return \Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $itemIdRule = 'nullable';
        switch ($this->event_type){
            case 'google':
                $itemIdRule .= '|string';
                break;
            case 'tasks':
                $itemIdRule .= '|integer|exists:works,id';
                break;
            case 'todos':
                $itemIdRule .= '|integer';
                break;
        }
        return [
            'event_type' => 'required|string|in:google,tasks,todos',
            'item_name' => 'required|string|max:191',
            'project_id' => 'nullable|integer|exists:projects,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'item_id' => $itemIdRule,
            'work_time_id' => 'nullable|integer|exists:work_times,id',
        ];
    }
}
