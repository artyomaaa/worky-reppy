<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorksStoreRequest extends FormRequest
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
            'name' => 'required|max:191',
            'start_date_time' => 'required',
            'end_date_time' => 'required',
            'project_id' => 'integer' . $projectExistsValidation,
            'tagIds' => 'array',
            'tagIds.*' => 'integer',
        ];
    }
}
