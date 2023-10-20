<?php

namespace App\Services;

use App\Repositories\UserProjectRepository;
use App\Services\Interfaces\UserProjectServiceInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class UserProjectService extends BaseService implements UserProjectServiceInterface
{
    /**
     * UserProjectService constructor.
     *
     * @param UserProjectRepository $userProjectRepository
     */
    public function __construct(UserProjectRepository $userProjectRepository)
    {
        parent::__construct($userProjectRepository);
    }

    /**
     * Update User Role user_project_role_id.
     * @param array $attributes
     * @param int $id
     * @return bool
     */
    public function updateUserProjectRoleId(array $attributes, int $id): bool
    {
        return $this->modelRepository->update($attributes, $id);
    }

    /**
     * Get Existing Assigned User Ids.
     * @param int $projectId
     * @return array
     */
    public function getExistingAssignedUserIds(int $projectId): array
    {
        return $this->modelRepository->userIdsByProjectId($projectId);
    }

    /**
     * Get user project by user id and project id.
     * @param int $userId
     * @param int $projectId
     * @return Model
     */
    public function getUserProjectByUserIdAndProjectId(int $userId, int $projectId): ?Model
    {
        return $this->modelRepository->userProjectByUserIdAndProjectId($userId, $projectId);
    }

    /**
     * Create New User Project Roles.
     * @param $selectedUsersList
     * @param $projectUserRoles
     * @param $projectId
     * @return bool
     */
    public function createNewUserProject($selectedUsersList, $projectUserRoles, $projectId): ?bool
    {
        $insertData = [];
        $nowTime = Carbon::now();
        $startDate = $nowTime;
        $endDate = null;
        $rate = null;
        $rateCurrency = config('app.default_currency');
        foreach ($selectedUsersList as $attachUser) {
            $userProjectRoleId = null;
            if ($projectUserRoles) {
                foreach ($projectUserRoles as $projectUserRole) {
                    if ($projectUserRole->name === $attachUser['userRole']) {
                        $userProjectRoleId = $projectUserRole->id;
                        if (!empty($attachUser['startDate'])) {
                            $startDate = Carbon::parse($attachUser['startDate'])->format('Y-m-d');
                        }
                        if (!empty($attachUser['endDate'])) {
                            $endDate = Carbon::parse($attachUser['endDate'])->format('Y-m-d');
                        }
                        if (!empty($attachUser['rate'])) {
                            $rate = (float)$attachUser['rate'];
                        }
                        if (!empty($attachUser['rateCurrency'])) {
                            $rateCurrency = $attachUser['rateCurrency'];
                        }
                        break;
                    }
                }
            }
            $insertData[] = [
                'user_id' => $attachUser['id'],
                'user_project_role_id' => $userProjectRoleId,
                'project_id' => $projectId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'rate' => $rate,
                'rate_currency' => $rateCurrency,
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ];
        }

        if (!empty($insertData)) {
            return $this->modelRepository->insert($insertData);
        }
    }

    /**
     * Update New User Project Roles.
     * @param $usersToAttach
     * @param $projectUserRoles
     * @param $newAssignedUsers
     * @param $projectId
     * @return bool
     */
    public function createNewAndChangeExistingUsers($usersToAttach, $projectUserRoles, $newAssignedUsers, $projectId): ?bool
    {
        $insertData = [];
        $nowTime = Carbon::now();
        foreach ($usersToAttach as $attachUserId) {
            $userProjectRoleId = null;
            $startDate = $nowTime;
            $endDate = null;
            $rate = null;
            $rateCurrency = config('app.default_currency');
            foreach ($newAssignedUsers as $user) {
                if ($user['id'] === $attachUserId) {
                    if ($projectUserRoles) {
                        foreach ($projectUserRoles as $projectUserRole) {
                            if ($projectUserRole->name === $user['userRole']) {
                                $userProjectRoleId = $projectUserRole->id;
                                if (!empty($user['startDate'])) {
                                    $startDate = Carbon::parse($user['startDate'])->format('Y-m-d');
                                }
                                if (!empty($user['endDate'])) {
                                    $endDate = Carbon::parse($user['endDate'])->format('Y-m-d');
                                }
                                if (!empty($user['rate'])) {
                                    $rate = (float)$user['rate'];
                                }
                                if (!empty($user['rateCurrency'])) {
                                    $rateCurrency = $user['rateCurrency'];
                                }
                                break;
                            }
                        }
                    }
                }
            }

            $insertData[] = [
                'user_id' => $attachUserId,
                'user_project_role_id' => $userProjectRoleId,
                'project_id' => $projectId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'rate' => $rate,
                'rate_currency' => $rateCurrency,
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ];
        }

        if (count($insertData) > 0) {
            return $this->modelRepository->insert($insertData);
        }
    }

    /**
     * Detach Users.
     * @param $userIds
     * @param $projectId
     * @return bool
     */
    public function detachUsers($projectId, $userIds = []): ?bool
    {
        return $this->modelRepository->detachUsers($projectId, $userIds);
    }

    public function getItemsByProjectIdsAndDateRange(array $projectIds, $startDateTime, $endDateTime)
    {
        return $this->modelRepository->getItemsByProjectIdsAndDateRange($projectIds, $startDateTime, $endDateTime);
    }

    /**
     * @param int $projectId
     * @param int $userId
     * @return mixed
     */
    public function getMemberHistory(int $projectId, int $userId)
    {
        return $this->modelRepository->getMemberHistory($projectId, $userId);
    }

    /**
     * @param array $userProjectIds
     * @param int $projectId
     * @return mixed
     */
    public function removeUserProjectItems(array $userProjectIds, int $projectId)
    {
        return $this->modelRepository->removeUserProjectItems($userProjectIds, $projectId);
    }

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function updateMemberHistory(array $validatedData)
    {

        return $this->modelRepository->updateMemberHistory($validatedData);
    }

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function removeMemberHistory(array $validatedData)
    {
        return $this->modelRepository->removeMemberHistory($validatedData);
    }

    /**
     * @param array $validatedData
     * @return mixed
     */
    public function unassignedMemberFromProject(array $validatedData)
    {
        return $this->modelRepository->unassignedMemberFromProject($validatedData);
    }
}
