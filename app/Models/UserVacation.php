<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserVacation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'type', 'status', 'start_date', 'end_date'
    ];

    /**
     * Get the user that owns the vacation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
