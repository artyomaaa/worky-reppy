<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWorkHistory extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'type', 'title', 'description', 'date'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'date' => 'date'
    ];

    /**
     * Get the user that owns the work day.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
