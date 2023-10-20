<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorksStartRequest extends FormRequest
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
            'work_id' => 'integer|exists:works,id|nullable',
            'work_time_id' => 'integer|exists:work_times,id|nullable',
            'project_id' => 'nullable|integer' . $projectExistsValidation,
            'name' => 'required|string|max:191',
            'tagIds' => 'array',
            'tagIds.*' => 'integer',
        ];
    }
}
