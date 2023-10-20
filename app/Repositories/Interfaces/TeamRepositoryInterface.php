<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

interface TeamRepositoryInterface
{
    /**
     * @return Builder
     */
    public function queryWithMembersProjects($teamIds): Builder;

    /**
     * @param int $status
     * @return Builder
     */
    public function queryByStatusWithMembers(int $status): Builder;

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
     * @param int $teamId
     * @return mixed
     */
    public function getTeamById(int $teamId);
}
