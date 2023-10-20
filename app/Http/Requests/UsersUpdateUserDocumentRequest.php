<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsersUpdateUserDocumentRequest extends FormRequest
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
            'document' => 'file|mimes:jpg,jpeg,png,txt,docx,doc,xlsx,pdf|max:' . env('MAX_FILE_UPLOAD_SIZE', 10240),
            'size' => 'required|integer',
            'user_id' => 'required|integer|exists:users,id',
            'file_type' => 'nullable|string',
            'name' => 'string',
            'type' => 'string'
        ];
    }
}
