<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Model;

interface UserProjectServiceInterface
{
    /**
     * Update User Role user_project_role_id.
     * @param array $attributes
     * @param int $id
     * @return bool
     */
    public function updateUserProjectRoleId(array $attributes, int $id): bool;

    /**
     * Get Existing Assigned User Ids.
     * @param int $projectId
     * @return array
     */
    public function getExistingAssignedUserIds(int $projectId): array;

    /**
     * Get user project by user id and project id.
     * @param int $userId
     * @param int $projectId
     * @return Model
     */
    public function getUserProjectByUserIdAndProjectId(int $userId, int $projectId): ?Model;

    /**
     * Create New User Project Roles.
     * @param $selectedUsersList
     * @param $projectUserRoles
     * @param $projectId
     * @return bool
     */
    public function createNewUserProject($selectedUsersList, $projectUserRoles, $projectId): ?bool;

    /**
     * Update New User Project Roles.
     * @param $usersToAttach
     * @param $projectUserRoles
     * @param $newAssignedUsers
     * @param $projectId
     * @return bool
     */
    public function createNewAndChangeExistingUsers($usersToAttach, $projectUserRoles, $newAssignedUsers, $projectId): ?bool;

    /**
     * Detach Users.
     * @param $userIds
     * @param $projectId
     * @return bool
     */
    public function detachUsers($projectId, $userIds = []): ?bool;

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
