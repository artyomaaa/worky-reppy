<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RemovePermissionFromRoleRequest extends FormRequest
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
            'role_type' => 'required|string|in:company,team,project',
            'role_id' => 'required|integer',
            'permission' => 'required|string',
        ];
    }
}
