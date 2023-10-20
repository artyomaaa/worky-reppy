<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartWorkFromTodoRequest extends FormRequest
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
            'todo_id' => 'required|integer|exists:todos,id',
            'user_id' => 'required|integer|exists:users,id',
            'project_id' => 'nullable|integer|exists:projects,id',
        ];
    }
}
