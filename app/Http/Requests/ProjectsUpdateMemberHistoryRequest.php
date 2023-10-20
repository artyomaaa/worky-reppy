<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectsUpdateMemberHistoryRequest extends FormRequest
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
            'status' => 'required|integer',
            'rate' => 'nullable|numeric',
            'rateCurrency' => 'string',
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'nullable|date_format:Y-m-d',
            'userId' => 'required|integer|exists:users,id',
            'projectId' => 'required|integer|exists:projects,id',
            'userProjectId' => 'nullable|integer|exists:user_projects,id',
            'userRole' => 'required|string',
        ];
    }
}
