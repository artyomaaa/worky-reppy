<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportsEffortsRequest extends FormRequest
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
        $rules = [
            'users' => is_array($this->users) ? 'array' : 'integer',
            'projects' => is_array($this->projects) ? 'array' : 'integer',
            'teams' => is_array($this->teams) ? 'array' : 'integer',
            'pageSize' => 'nullable|integer',
            'page' => 'nullable|integer',
            'status' => 'nullable|integer',
            'start_date_time' => 'required|date',
            'end_date_time' => 'required|date',
            'isExport' => 'boolean',
        ];

        if (is_array($this->users)) {
            $rules['users.*'] = 'integer';
        }
        if (is_array($this->projects)) {
            $rules['projects.*'] = 'integer';
        }
        if (is_array($this->teams)) {
            $rules['teams.*'] = 'integer';
        }

        return $rules;
    }
}
