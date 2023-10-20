<?php

namespace App\Repositories;

use App\Models\TeamMember;
use App\Repositories\Interfaces\TeamMemberRepositoryInterface;

class TeamMemberRepository extends BaseRepository implements TeamMemberRepositoryInterface
{

    /**
     * TeamMemberRepository constructor.
     *
     * @param TeamMember $model
     */
    public function __construct(TeamMember $model)
    {
        parent::__construct($model);
    }

    /**
     * @param int $teamId
     * @return array
     */
    public function userIdsByTeamId(int $teamId): array
    {
        return $this->model->where('team_id', $teamId)->pluck('user_id')->toArray();
    }

    /**
     * @param array $teamIds
     * @return array
     */
    public function userIdsByTeamIds(array $teamIds): array
    {
        return $this->model->whereIn('team_id', $teamIds)->pluck('user_id')->toArray();
    }

    /**
     * @param int $teamId
     * @return bool
     */
    public function deleteByTeamId(int $teamId): bool
    {
        return $this->model->where('team_id', $teamId)->delete();
    }
}
