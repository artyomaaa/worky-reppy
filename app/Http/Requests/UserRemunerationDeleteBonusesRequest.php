<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRemunerationDeleteBonusesRequest extends FormRequest
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
            'bonus' => 'nullable|integer',
            'created_at' => 'nullable|date',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
            'id' => 'required|integer',
            'key' => 'nullable|string',
            'title' => 'nullable|string',
            'type' => 'required|string',
            'updated_at' => 'nullable|date',
            'user_id' => 'required|integer',
            'currency' => 'nullable|string',
        ];
    }
}
