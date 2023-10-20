<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserCasualInfoRequest extends FormRequest
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
            'id' => 'required|integer|exists:users,id',
            'casualId' => 'nullable|integer|exists:user_casuals,id',
            'title' => 'required|string|max:191',
            'value' => 'required|string|max:191',
        ];
    }
}
