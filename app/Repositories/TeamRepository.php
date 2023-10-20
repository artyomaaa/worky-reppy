<?php

namespace App\Repositories;

use App\Models\Team;
use App\Repositories\Interfaces\TeamRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class TeamRepository extends BaseRepository implements TeamRepositoryInterface
{

    /**
     * TeamRepository constructor.
     *
     * @param Team $model
     */
    public function __construct(Team $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Builder
     */
    public function queryWithMembersProjects($teamIds): Builder
    {
        if(!empty($teamIds)){
            return $this->model->with('members')->with('projects')->whereIn('id', $teamIds);
        }
        return $this->model->with('members')->with('projects');
    }

    /**
     * @return Builder
     */
    public function queryWithMembers(): Builder
    {
        return $this->model->with('members');
    }

    /**
     * @param int $status
     * @return Builder
     */
    public function queryByStatusWithMembers(int $status): Builder
    {
        return $this->model->where('status', $status)->with('members');
    }

    /**
     * @param int $id
     * @return Model|null
     */
    public function teamByIdWithMembersProjects(int $id): ?Model
    {
        return $this->model->where('id', $id)->with('members')->with('projects')->first();
    }

    /**
     * @param array $userIds
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function userWorkDurations(array $userIds, string $startDateTime, string $endDateTime)
    {
        return $this->model->getUserWorkDurations($userIds, $startDateTime, $endDateTime);
    }

    /**
     * @param int $userId
     * @param string|null $startDateTime
     * @param string|null $endDateTime
     * @return mixed
     */
    public function teamMemberWorkDuration(int $userId, $startDateTime = null, $endDateTime = null)
    {
        return $this->model->getTeamMemberWorkDuration($userId, $startDateTime, $endDateTime);
    }

    /**
     * @param int $teamId
     * @return mixed
     */
    public function getTeamById(int $teamId)
    {
        return Team::where('id', $teamId)->with('members')->first();
    }
}
