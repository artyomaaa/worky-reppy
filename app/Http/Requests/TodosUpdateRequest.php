<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TodosUpdateRequest extends FormRequest
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
            'name' => 'required|string|max:191',
            'description' => 'nullable|string|max:1000',
            'user_id' => 'nullable|integer|exists:users,id',
            'project_id' => 'nullable|integer|exists:projects,id',
            'start_date_time' => 'nullable|date_format:Y-m-d H:i:s',
            'end_date_time' => 'nullable|date_format:Y-m-d H:i:s',
            'status' => 'nullable|integer',
            'tag_ids' => 'array',
            'tag_ids.*' => 'integer',
        ];
    }
}
