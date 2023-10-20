<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLanguage extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'language',
        'proficiency_level'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
