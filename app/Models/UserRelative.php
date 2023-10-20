<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRelative extends Model
{
    protected $fillable = ['user_id', 'type', 'full_name', 'email', 'gender', 'birthday', 'phone_number', 'birthplace'];
}
