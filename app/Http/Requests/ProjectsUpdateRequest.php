<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectsUpdateRequest extends FormRequest
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
            'name' => 'required|max:191|unique:projects,name,' . $this->route('id'),
            'description' => 'nullable|string|max:345',
            'status' => 'required|integer',
            'price' => 'numeric',
            'price_currency' => 'string',
            'removedUserProjectIds' => 'nullable|array',
            'selectedUsersList' => 'nullable|array',
            'project_technology' => 'nullable|array',
            'project_technology.*' => 'string',
            'color' => 'nullable|string',
            'type' => 'nullable|string',
            'deadline' => 'nullable|date',
        ];
    }
}
