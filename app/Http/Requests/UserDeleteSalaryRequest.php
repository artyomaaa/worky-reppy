<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserDeleteSalaryRequest extends FormRequest
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
            'id' => 'required|integer',
            'user_id' => 'required|integer',
            'created_at' => 'nullable|date',
            'end_date' => 'nullable|date',
            'key' => 'nullable|string',
            'salary' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'status' => 'nullable|integer',
            'true_cost' => 'nullable|integer',
            'user_level_id' => 'nullable|integer',
            'updated_at' => 'nullable|date',
            'rate' => 'nullable|integer',
            'salary_currency' => 'nullable|string',
            'true_cost_currency' => 'nullable|string',
        ];
    }
}
