<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsersRemunerationUpdateSalaryRequest extends FormRequest
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
            'id' => 'required|integer|exists:user_salaries,id',
            'user_id' => 'required|integer|exists:users,id',
            'date' => 'required|date',
            'salary' => 'required|integer',
            'true_cost' => 'required|integer',
            'rate' => 'required|integer',
        ];
    }
}
