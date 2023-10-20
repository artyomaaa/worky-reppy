<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportsProjectMemberListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return \Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'users' => is_array($this->users) ? 'array' : 'integer',
            'start_date_time' => 'required|date',
            'end_date_time' => 'required|date',
            'projects' => is_array($this->projects) ? 'array' : 'integer',
        ];
    }
}
