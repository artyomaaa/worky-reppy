<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserJobInformation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'interview',
        'work_contract',
        'work_contract_start_date',
        'position',
        'experimental_period_start_date',
        'experimental_period_end_date',
        'position_description',
        'company_name',
        'location',
        'work_contract_end_date',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'created_at', 'updated_at'
    ];

    /**
     * Get the user who owns the contact.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
