<?php

namespace App\Models;

use http\QueryString;
use Illuminate\Database\Eloquent\Model;
use App\Traits\StatusQueries;

class Project extends Model
{
    use StatusQueries;

    const INACTIVE = 0;
    const ACTIVE = 1;
    const ARCHIVED = 2;

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
     * Mutator that appends in query result sets as though it is part of db table
     *
     * @var array
     */
    protected $appends = ['attached_users','project_technologies'];

    /**
     * Attached User Accessor.
     *
     * @return array
     */
    public function getAttachedUsersAttribute(): array
    {
        $attachedUsersObject = $this->attachedUsers()->get();
        if ($attachedUsersObject->isEmpty()) return [];

        $userIds = $attachedUsersObject->pluck('id')->toArray();
        $workedTotalDurations = $this->getWorkedTotalDurationsByUserIds($userIds)->pluck('totalDuration', 'user_id');

        $userProjectRoleIds = array_unique($attachedUsersObject->pluck('pivot.user_project_role_id')->toArray());
        $userProjectRoles = UserProjectRole::whereIn('id', $userProjectRoleIds)->pluck('name', 'id');
        return $attachedUsersObject->map(function ($item) use($workedTotalDurations, $userProjectRoles) {
            $userRole = $userProjectRoles[$item->pivot->user_project_role_id] ?? __('unknown');

            $totalDuration = isset($workedTotalDurations[$item->id])
                ? (int) $workedTotalDurations[$item->id]
                : 0;
            return [
                'id' => $item->id,
                'name' => $item->name,
                'surname' => $item->surname,
                'avatar' => $item->avatar,
                'key' => $item->id . '' . $item->name . ' ' . $item->surname,
                'userRole' =>$userRole,
                'startDate' => $item->pivot->start_date,
                'endDate' => $item->pivot->end_date,
                'rate' => null, // for the security of the project so as not to show the price of the project
                'rateCurrency' => $item->pivot->rate_currency,
                'totalDuration' => round($totalDuration / 3600, 2),
                'status' => $item->pivot->status,
                'userProjectId' => $item->pivot->id,
            ];
        })->toArray();
    }

    public function getProjectTechnologiesAttribute()
    {
        $projectTechnologiesObject = $this->projectTechnologies()->get();
        if (count($projectTechnologiesObject) > 0) {
            return $projectTechnologiesObject->map(function ($item, $key) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'key' => $item->id . '' . $item->name
                ];
            });
        }
        return [];
    }

    /**
     * Get the user that owns the project.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * get project attached users.
     */
    public function attachedUsers()
    {
        return $this->belongsToMany(User::class, 'user_projects', 'project_id', 'user_id')
            ->withPivot('id', 'rate', 'rate_currency', 'end_date', 'start_date', 'user_project_role_id', 'status')
            ->wherePivot('status' , '=', '1');
    }

    /**
     * get project attached users.
     */
    public function userProjects()
    {
        return $this->hasMany(UserProject::class, 'project_id', 'id');
    }

    public function projectTechnologies()
    {
        return $this->belongsToMany(Technology::class, 'project_technologies', 'project_id', 'technology_id')
            ->withPivot('technology_id', 'project_id');
    }

    /**
     * get project ids by user id.
     * @param $userId
     * @return array
     */
    public function getProjectIdsByUserId($userId): array
    {
        return $this->join('works', 'projects.id', '=', 'works.project_id')
            ->groupBy('projects.id')
            ->where('works.user_id', $userId)->pluck('projects.id')->toArray();
    }

    /**
     * @param $userIds
     * @return mixed
     */
    private function getWorkedTotalDurationsByUserIds($userIds)
    {
        return \DB::table(self::getTable())
            ->join('works', 'projects.id', '=', 'works.project_id')
            ->join('work_times', 'works.id', '=', 'work_times.work_id')
            ->where('projects.id', $this->id)
            ->whereIn('works.user_id', $userIds)
            ->groupBy('works.user_id')
            ->select([
                'works.user_id',
                \DB::raw('SUM(work_times.duration) as totalDuration')
            ])
            ->get();
    }

    /**
     * @param array $projectIds
     * @return mixed
     */
    public function getUserAttachedProjectsQuery(array $projectIds)
    {
        return \DB::table(self::getTable())
            ->whereIn('id', $projectIds)
            ->orderBy('name');
    }

    /**
     * @return  mixed
     */
    public function getAllProjectsQuery()
    {
        return \DB::table(self::getTable())
            ->orderBy('name');
    }
}
