<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTechnology extends Model
{
    protected $fillable = [
        'technology_id', 'project_id', 'date'
    ];
}
