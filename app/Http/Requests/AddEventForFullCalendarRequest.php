<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddEventForFullCalendarRequest extends FormRequest
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
            'all_day' => 'required|boolean',
            'user_id' => 'required|integer|exists:users,id',
            'event_type' => 'required|string|in:google,todos',
            'item_name' => 'required|string|max:191',
            'start_date_time' => 'required|date_format:Y-m-d H:i:s',
            'end_date_time' => 'nullable|date_format:Y-m-d H:i:s',
        ];
    }
}
