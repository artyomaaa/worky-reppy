<?php

namespace App\Services\Interfaces;

use App\Http\Requests\UserRoleListRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface RoleServiceInterface
{
    /**
     * @param User $user
     * @return Collection
     */
    public function userRoles(User $user): Collection;

    /**
     * @param array $roleNames
     * @return array
     */
    public function roleIdsByNames(array $roleNames): array;

    /**
     * @param array $roleNames
     * @return array
     */
    public function roleIdsByNamesAndNotHighestRole(array $roleNames): array;

    /**
     * @return mixed
     */
    public function getLowestRolePriority();

    /**
     * @param UserRoleListRequest $request
     * @return array|LengthAwarePaginator
     */
    public function rolesData(UserRoleListRequest $request);

    /**
     * @return mixed
     */
    public function getMainRoles();

    /**
     * @param int $roleId
     * @param int $page
     * @param int $perPage
     * @return mixed
     */
    public function getMemberList(int $roleId, $page = 1, $perPage = 10);

    /**
     * @param $role
     * @param array $defaultPermissions
     * @return mixed
     */
    public function syncDefaultPermissions($role, $defaultPermissions = []);

    /**
     * @param $role
     * @return mixed
     */
    public function getAllPermissions($role);

    /**
     * @param int $roleId
     * @return mixed
     */
    public function getAllUserList(int $roleId);

    /**
     * @param int $roleId
     * @param array $userIds
     * @return mixed
     */
    public function assignUsersToRole(int $roleId, array $userIds);

    /**
     * @param int $roleId
     * @param array $userIds
     * @return mixed
     */
    public function removeUsersFromRole(int $roleId, array $userIds);
}
