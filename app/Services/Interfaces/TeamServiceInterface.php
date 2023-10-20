<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Model;

interface TeamServiceInterface
{
    /**
     * @param int $id
     * @return Model|null
     */
    public function teamByIdWithMembersProjects(int $id): ?Model;

    /**
     * @param array $userIds
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function userWorkDurations(array $userIds, string $startDateTime, string $endDateTime);

    /**
     * @param int $userId
     * @param string|null $startDateTime
     * @param string|null $endDateTime
     * @return mixed
     */
    public function teamMemberWorkDuration(int $userId, $startDateTime = null, $endDateTime = null);

    /**
     * @param int $id
     * @param bool $status
     * @return mixed
     */
    public function updateTeamStatus(int $id, bool $status);

    /**
     * @param int $teamId
     * @return mixed
     */
    public function getTeamById(int $teamId);


}
