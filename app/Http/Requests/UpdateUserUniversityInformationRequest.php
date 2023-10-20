<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserUniversityInformationRequest extends FormRequest
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
            'type' => 'required',
            'school' => 'required|string',
            'degree' => 'required',
            'faculty_of_study' => 'required|string',
            'field_of_study' => 'required|string',
            'starting_from' => 'required',
            'ending_in' => 'required',
        ];
    }
}
