<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDocument extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'uploader_id', 'name', 'type', 'size', 'file', 'file_type'
    ];

    /**
     * Get the user that owns the document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who added the document.
     */
    public function userAdded()
    {
        return $this->belongsTo(User::class, 'id', 'uploader_id');
    }
}
