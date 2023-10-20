<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSkill extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'skill_id', 'user_id', 'date'
    ];

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'user_skills', 'skill_id', 'user_id')
            ->withPivot('skill_id', 'user_id');
    }
}
