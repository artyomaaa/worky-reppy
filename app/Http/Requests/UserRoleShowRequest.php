<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRoleShowRequest extends FormRequest
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
        $itemIdRule = 'required|integer';
        switch ($this->role_type){
            case 'company':
                $itemIdRule .= '|exists:roles,id';
                break;
            case 'team':
                $itemIdRule .= '|exists:team_member_roles,id';
                break;
            case 'project':
                $itemIdRule .= '|exists:user_project_roles,id';
                break;
        }

        return [
            'id' => $itemIdRule,
            'role_type' => 'required|string|in:company,team,project',
            'users_page' => 'integer|gt:0',
            'users_per_page' => 'integer|gt:0',
        ];
    }
}
