<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNote extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'author_of_notes', 'notes_visibility', 'notes_text', 'notes_type',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
      'created_at'
    ];

    /**
     * Get the user who owns the contact.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
