<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSoftSkill extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'soft_skill_id', 'user_id', 'date'
    ];


}
