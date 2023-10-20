<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectsListRequest extends FormRequest
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
            'page' => 'nullable|integer',
            'pageSize' => 'nullable|integer',
            'status' => 'nullable|integer',
            'name' => 'nullable|string',
            'created_at' => 'nullable|array',
        ];
    }
}
