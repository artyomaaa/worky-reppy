<?php

namespace App\Services\Interfaces;

interface TeamMemberServiceInterface
{
    /**
     * @param int $teamId
     * @return array
     */
    public function userIdsByTeamId(int $teamId): array;

    /**
     * @param array $teamIds
     * @return array
     */
    public function userIdsByTeamIds(array $teamIds): array;

    /**
     * @param int $teamId
     * @return bool
     */
    public function deleteByTeamId(int $teamId): bool;
}
