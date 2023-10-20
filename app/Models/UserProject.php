<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\StatusQueries;

class UserProject extends Model
{
    use StatusQueries;

    const INACTIVE = 0;
    const ACTIVE = 1;
    const ARCHIVED = 2;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'project_id', 'user_project_role_id', 'rate', 'rate_currency', 'start_date', 'end_date', 'status'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function userProjectRole()
    {
        return $this->belongsTo('UserProjectRole');
    }
}
