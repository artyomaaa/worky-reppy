<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorksRemoveWorkTimeRequest extends FormRequest
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
            'work_id' => 'required|integer|exists:works,id',
            'work_time_id' => 'required|integer|exists:work_times,id',
        ];
    }
}
