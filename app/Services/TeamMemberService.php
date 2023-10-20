<?php

namespace App\Services;

use App\Repositories\TeamMemberRepository;
use App\Services\Interfaces\TeamMemberServiceInterface;

class TeamMemberService extends BaseService implements TeamMemberServiceInterface
{
    /**
     * TeamMemberService constructor.
     *
     * @param TeamMemberRepository $teamMemberRepository
     */
    public function __construct(TeamMemberRepository $teamMemberRepository)
    {
        parent::__construct($teamMemberRepository);
    }

    /**
     * @param int $teamId
     * @return array
     */
    public function userIdsByTeamId(int $teamId): array
    {
        return $this->modelRepository->userIdsByTeamId($teamId);
    }

    /**
     * @param array $teamIds
     * @return array
     */
    public function userIdsByTeamIds(array $teamIds): array
    {
        return $this->modelRepository->userIdsByTeamIds($teamIds);
    }

    /**
     * @param int $teamId
     * @return bool
     */
    public function deleteByTeamId(int $teamId): bool
    {
        return $this->modelRepository->deleteByTeamId($teamId);
    }
}
