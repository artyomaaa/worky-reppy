<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRoleAssignUsersToRoleRequest extends FormRequest
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
            'added_user_ids' => 'nullable|array',
            'added_user_ids.*' => 'integer',
            'removed_user_ids' => 'nullable|array',
            'removed_user_ids.*' => 'integer',
        ];
    }
}
