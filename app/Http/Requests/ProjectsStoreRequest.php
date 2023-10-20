<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectsStoreRequest extends FormRequest
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
            'name' => 'required|max:191|unique:projects,name', // TODO maybe here should be $this->route('id') or $this->id
            'description' => 'nullable|string|max:1000',
            'status' => 'required|integer',
            'price' => 'numeric',
            'price_currency' => 'string',
            'selectedUsersList' => 'nullable|array',
            'project_technology' => 'nullable|array',
            'project_technology.*' => 'string',
            'color' => 'nullable|string',
            'type' => 'nullable|string',
            'deadline' => 'nullable|date',
        ];
    }
}
