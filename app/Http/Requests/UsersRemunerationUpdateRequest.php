<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsersRemunerationUpdateRequest extends FormRequest
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
        $rules = [
            'id' => 'required|integer|exists:users,id',
            'job_type' => 'required|integer|exists:user_job_types,id',
            'salaries' => 'nullable|array',
            'bonusesOtherSpends' => 'nullable|array',
        ];
        if (!empty($this->salaries) && is_array($this->salaries)) {
            $rules['salaries.*.id'] = 'nullable|integer|exists:user_salaries,id';
            $rules['salaries.*.user_level_id'] = 'nullable|integer|exists:user_levels,id';
            $rules['salaries.*.start_date'] = 'required|date';
            $rules['salaries.*.end_date'] = 'nullable|date|after_or_equal:salaries.*.start_date';
            $rules['salaries.*.salary'] = 'required|numeric';
            $rules['salaries.*.salary_currency'] = 'required|string|max:3';
            $rules['salaries.*.true_cost'] = 'required|numeric';
            $rules['salaries.*.true_cost_currency'] = 'required|string|max:3';
        }
        if (!empty($this->bonusesOtherSpends) && is_array($this->bonusesOtherSpends)) {
            $rules['bonusesOtherSpends.*.id'] = 'nullable|integer|exists:user_bonuses,id';
            $rules['bonusesOtherSpends.*.bonus'] = 'required|numeric';
            $rules['bonusesOtherSpends.*.currency'] = 'required|string|max:3';
            $rules['bonusesOtherSpends.*.date'] = 'required|date|date_format:Y-m-d';
            $rules['bonusesOtherSpends.*.title'] = 'nullable|string|max:191';
            $rules['bonusesOtherSpends.*.description'] = 'nullable|string|max:1000';
        }
        return $rules;
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'salaries.*.id.integer' => __('Invalid salary data'),
            'salaries.*.id.exists' => __('Invalid salary data'),

            'salaries.*.user_level_id.integer' => __('Invalid salary data'),
            'salaries.*.user_level_id.exists' => __('Invalid salary data'),

            'salaries.*.start_date.required' => __('The Salary start date required'),
            'salaries.*.start_date.date' => __('Invalid salary start date'),

            'salaries.*.end_date.date' => __('Invalid salary end date'),
            'salaries.*.end_date.after_or_equal' => __('The Salary end date must be greater then start date'),

            'salaries.*.salary.required' => __('The Growth Salary required'),
            'salaries.*.salary.numeric' => __('The Growth Salary must be numeric'),

            'salaries.*.salary_currency.required' => __('The Growth Salary currency required'),
            'salaries.*.salary_currency.string' => __('The Growth Salary currency must be string'),
            'salaries.*.salary_currency.max' => __('The Growth Salary currency string length must be max 3 later'),

            'salaries.*.true_cost.required' => __('The Net Salary required'),
            'salaries.*.true_cost.numeric' => __('The Net Salary must be numeric'),

            'salaries.*.true_cost_currency.required' => __('The Net Salary currency required'),
            'salaries.*.true_cost_currency.string' => __('The Net Salary currency must be string'),
            'salaries.*.true_cost_currency.max' => __('The Net Salary currency string length must be max 3 later'),

            'bonusesOtherSpends.*.id.integer' => __('Invalid Bonus/Other spend data'),
            'bonusesOtherSpends.*.id.exists' => __('Invalid Bonus/Other spend data'),

            'bonusesOtherSpends.*.bonus.required' => __('The Bonus or overtime required'),
            'bonusesOtherSpends.*.bonus.numeric' => __('The Bonus or overtime must be numeric'),

            'bonusesOtherSpends.*.currency.required' => __('The Bonus/Other spend currency required'),
            'bonusesOtherSpends.*.currency.string' => __('The Bonus/Other spend currency must be string'),
            'bonusesOtherSpends.*.currency.max' => __('The Bonus/Other spend currency string length must be max 3 later'),

            'bonusesOtherSpends.*.date.required' => __('The Bonus/other spend date is required'),
            'bonusesOtherSpends.*.date.date' => __('Invalid Bonus/Other spend date'),
            'bonusesOtherSpends.*.date.date_format' => __('Invalid Bonus/Other spend date format'),

            'bonusesOtherSpends.*.title.string' => __('The Bonus/Other spend title must be string'),
            'bonusesOtherSpends.*.title.max' => __('The Bonus/Other spend title must be max 191 later'),

            'bonusesOtherSpends.*.description.string' => __('The Bonus/Other spend description must be string'),
            'bonusesOtherSpends.*.description.max' => __('The Bonus/Other spend description must be max 1000 later'),
        ]);
    }
}
