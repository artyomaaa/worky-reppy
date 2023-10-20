<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserFullCalendarRequest extends FormRequest
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
        return [
            'userId' => 'required|integer|exists:users,id',
            'start_date_time' => 'required|date',
            'end_date_time' => 'required|date',
            'view_items' => 'array',
            'view_items.*' => 'string|in:google,tasks,todos,projects,tags',
        ];
    }
}
