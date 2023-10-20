<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSalary extends Model
{
    protected $table = 'user_salaries';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $guarded = [];
}
