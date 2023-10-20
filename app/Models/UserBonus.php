<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBonus extends Model
{
    const TYPE_BONUS = 'bonus';
    const TYPE_OTHER_SPEND = 'other_spend';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get the user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
