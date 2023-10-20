<?php

namespace App\Repositories;

use App\Models\UserProject;
use App\Repositories\Interfaces\UserProjectRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class UserProjectRepository extends BaseRepository implements UserProjectRepositoryInterface
{
    /**
     * UserProjectRepository constructor.
     *
     * @param UserProject $model
     */
    public function __construct(UserProject $model)
    {
        parent::__construct($model);
    }

    /**
     * Get user project by user id and project id.
     * @param int $userId
     * @param int $projectId
     * @return Model
     */
    public function userProjectByUserIdAndProjectId(int $userId, int $projectId): ?Model
    {
        return $this->model
            ->active()
            ->where('user_id', $userId)
            ->where('project_id', $projectId)
            ->first();
    }

    /**
     * Get Existing Assigned User Ids.
     * @param int $projectId
     * @return array
     */
    public function userIdsByProjectId(int $projectId): array
    {
        return $this->model
            ->active()
            ->where('project_id', $projectId)
            ->pluck('user_id')->toArray();
    }

    /**
     * Detach Users.
     * @param $userIds
     * @param $projectId
     * @return bool
     */
    public function detachUsers($projectId, $userIds = []): ?bool
    {
        $nowTime = Carbon::now();
        $query = $this->model
            ->active()
            ->where('project_id', $projectId);

        if (count($userIds) > 0) {
            $query = $query->whereIn('user_id', $userIds);
        }

        return $query->update(['status' => '0', 'end_date' => $nowTime]);
    }

    /**
     * @param array $projectIds
     * @param $startDateTime
     * @param $endDateTime
     * @return mixed
     */
    public function getItemsByProjectIdsAndDateRange(array $projectIds, $startDateTime, $endDateTime)
    {
        return $this->model
            ->leftJoin('user_project_roles', 'user_project_roles.id', '=', 'user_projects.user_project_role_id')
            ->where(function($q) use($startDateTime, $endDateTime){
                $q->where([
                    ['start_date', '>=', $startDateTime],
                    ['start_date', '<=', $endDateTime],
                ])
                ->orWhere(function ($q) use ($startDateTime, $endDateTime) {
                    $q->where([
                        ['start_date', '<=', $startDateTime],
                        ['end_date', '>=', $startDateTime],
                    ])
                    ->orWhere(function ($q) use ($startDateTime){
                        $q->where('start_date', '<=', $startDateTime);
                        $q->whereNull('end_date');
                    });;
                });
             })
            ->whereIn('project_id', $projectIds)
//            ->whereNotNull('rate') // important
            ->get([
                'project_id',
                'user_id',
                'start_date',
                'end_date',
                'rate',
                'rate_currency',
                'status',
                'user_project_roles.name as user_project_role_name',
            ]);
    }

    /**
     * @param int $projectId
     * @param int $userId
     * @return mixed
     */
    public function getMemberHistory(int $projectId, int $userId)
    {
        return $this->model
            ->join('users', 'users.id', '=', 'user_projects.user_id')
            ->leftJoin('user_project_roles', 'user_project_roles.id', '=', 'user_projects.user_project_role_id')
            ->where([
                ['project_id', '=', $projectId],
                ['user_id', '=', $userId],
            ])
            ->orderByRaw("user_projects.start_date, user_projects.end_date")
            ->get([
                'user_projects.id',
                'user_projects.project_id',
                'user_projects.user_id',
                'user_projects.start_date as startDate',
                'user_projects.end_date as endDate',
                'user_projects.rate',
                'user_projects.rate_currency as rateCurrency',
                'user_projects.status',
                'user_project_roles.name as userRole',
                'users.name',
                'users.surname',
                'users.avatar',
            ]);
    }

    /**
     * @param array $userProjectIds
     * @param int $projectId
     * @return mixed
     */
    public function removeUserProjectItems(array $userProjectIds, int $projectId)
    {
        return $this->model
            ->where('project_id', $projectId)
            ->whereIn('id', $userProjectIds)
            ->delete();
    }

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function updateMemberHistory(array $validatedData)
    {
        return $this->model->where([
            ['user_id', '=', $validatedData['userId']],
            ['project_id', '=', $validatedData['projectId']],
            ['id', '=', $validatedData['userProjectId']],
        ])->update([
            'user_project_role_id' => $validatedData['userProjectRoleId'],
            'rate' => $validatedData['rate'],
            'rate_currency' => $validatedData['rateCurrency'],
            'start_date' => $validatedData['startDate'],
            'end_date' => $validatedData['endDate'],
            'status' => $validatedData['status'],
        ]);
    }

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function removeMemberHistory(array $validatedData)
    {
        return $this->model->where([
            ['user_id', '=', $validatedData['userId']],
            ['project_id', '=', $validatedData['projectId']],
            ['id', '=', $validatedData['userProjectId']],
        ])->delete();
    }

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function unassignedMemberFromProject(array $validatedData)
    {
        $item = $this->model->where([
            ['user_id', '=', $validatedData['userId']],
            ['project_id', '=', $validatedData['projectId']],
            ['id', '=', $validatedData['userProjectId']],
        ])->first();
        if ($item) {
            $item->status = 0; // make as old
            if (empty($item->end_date)) {
                $item->end_date = now();
            }
            $item->save();
        }
        return $item;
    }
}
