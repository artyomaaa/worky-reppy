<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    const DEVELOPER = 0;
    const PROJECT_MANAGER = 1;
    const TEAM_LEAD = 2;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'status' => 'integer',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function teamMemberRole()
    {
        return $this->belongsTo('TeamMemberRole');
    }
}
