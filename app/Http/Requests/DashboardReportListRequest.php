<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DashboardReportListRequest extends FormRequest
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
            'teamMember' => is_array($this->teamMember) ? 'array' : 'integer',
            'users' => is_array($this->users) ? 'array' : 'integer',
            'start_date_time' => 'required|date',
            'end_date_time' => 'required|date',
            'projectIds' => 'nullable|array',
        ];
    }
}
