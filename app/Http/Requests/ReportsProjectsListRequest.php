<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportsProjectsListRequest extends FormRequest
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
            'projects' => is_array($this->projects) ? 'array' : 'integer',
            'status' => 'integer',
            'start_date_time' => 'required|date',
            'end_date_time' => 'required|date',
        ];
    }
}
