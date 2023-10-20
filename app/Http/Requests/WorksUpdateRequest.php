<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorksUpdateRequest extends FormRequest
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
        $projectExistsValidation = !empty($this->project_id) ? '|exists:projects,id' : '';
        return [
            'formValues' => 'required',
            'formValues.start_date_time' => 'required|date_format:Y-m-d H:i:s',
            'formValues.end_date_time' => 'nullable|date_format:Y-m-d H:i:s',
            'formValues.name' => 'required|max:191',
            'formValues.project_id' => 'nullable|integer' . $projectExistsValidation,
            'formValues.description' => 'nullable|string',
            'work_id' => 'required|integer|exists:works,id',
            'work_time_id' => 'required|integer|exists:work_times,id',
            'displayByGroup' => 'boolean',
            'ongoingTask' => 'boolean',
            'tagIds' => 'array',
            'tagIds.*' => 'integer',
//            'start_date_time' => 'required',
//            'end_date_time' => 'required',
        ];
    }
}
