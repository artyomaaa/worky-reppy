<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsersUpdateJobInformationRequest extends FormRequest
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
            'id' => 'required',
            'role' => 'string|max:191|nullable',
            'status' => 'integer|nullable',
            'company_name' => 'string|nullable',
            'location' => 'string|nullable',
            'hard_skills' => 'array|nullable',
            'soft_skills' => 'array|nullable',
            'jobs' => 'nullable|array',
            'professional_story' => 'string|nullable',
        ];
        if (!empty($this->jobs) && is_array($this->jobs)) {
            if (isset($rules['jobs.*.id'])) {
                $rules['jobs.*.id'] = 'required|integer|exists:user_job_information,id';
            }
            $rules['jobs.*.interview'] = 'nullable|date|date_format:Y-m-d';
            $rules['jobs.*.work_contract'] = 'nullable|date|date_format:Y-m-d';
            $rules['jobs.*.work_contract_start_date'] = 'nullable|date|date_format:Y-m-d';
            $rules['jobs.*.work_contract_end_date'] = 'nullable|date|date_format:Y-m-d';
            $rules['jobs.*.experimental_period_start_date'] = 'nullable|date|date_format:Y-m-d';
            $rules['jobs.*.experimental_period_end_date'] = 'nullable|date|date_format:Y-m-d';
            $rules['jobs.*.position'] =  'required|string|max:191';
            $rules['jobs.*.position'] =  'required|string|max:1000';
            $rules['jobs.*.company_name'] =  'required|string|max:191';
            $rules['jobs.*.location'] =  'required|string|max:191';
        }
        return $rules;
    }
}
