<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsersListRequest extends FormRequest
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
            'page' => 'nullable|integer',
            'pageSize' => 'nullable|integer',
            'name' => 'nullable|string',
            'email' => 'nullable|string',
            'q' => 'nullable|string',
            'status' => 'nullable|integer',
            'roles' => !is_array($this->roles) ? 'nullable|string' : 'nullable|array',
            'created_at' => 'nullable|array',
            'sortBy' => 'nullable|string',
            'order' => 'nullable|string',
        ];
    }
}
