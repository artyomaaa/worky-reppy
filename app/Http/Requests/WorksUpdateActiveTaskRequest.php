<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorksUpdateActiveTaskRequest extends FormRequest
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
        $projectExistsValidation = !empty($this->project_id) ? '|exists:projects,id' : '';
        return [
            'taskName' => 'required|string',
            'projectId' => 'nullable|integer' . $projectExistsValidation,
        ];
    }
}
