<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;

interface UserProjectRepositoryInterface
{
    /**
     * Get user project by user id and project id.
     * @param int $userId
     * @param int $projectId
     * @return Model
     */
    public function userProjectByUserIdAndProjectId(int $userId, int $projectId): ?Model;

    /**
     * Get Existing Assigned User Ids.
     * @param int $projectId
     * @return array
     */
    public function userIdsByProjectId(int $projectId): array;

    /**
     * Detach Users.
     * @param $userIds
     * @param $projectId
     * @return bool
     */
    public function detachUsers($projectId, $userIds = []): ?bool;

    /**
     * @param array $projectIds
     * @param $startDateTime
     * @param $endDateTime
     * @return mixed
     */
    public function getItemsByProjectIdsAndDateRange(array $projectIds, $startDateTime, $endDateTime);

    /**
     * @param int $projectId
     * @param int $userId
     * @return mixed
     */
    public function getMemberHistory(int $projectId, int $userId);

    /**
     * @param array $userProjectIds
     * @param int $projectId
     * @return mixed
     */
    public function removeUserProjectItems(array $userProjectIds, int $projectId);

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function updateMemberHistory(array $validatedData);

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function removeMemberHistory(array $validatedData);

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function unassignedMemberFromProject(array $validatedData);
}
