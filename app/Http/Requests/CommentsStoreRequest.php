<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentsStoreRequest extends FormRequest
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
        $parentIdExists = !empty($this->parrent_id) ? '|exists:comments,id' : '';
        return [
            'user_id' => 'required|integer|exists:users,id',
            'work_time_id' => 'required|integer|exists:work_times,id',
            'text' => 'required|string',
            'parent_id' => 'nullable|integer' . $parentIdExists
        ];
    }
}
