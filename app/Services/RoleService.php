<?php

namespace App\Services;

use App\Http\Requests\UserRoleListRequest;
use App\Models\User;
use App\Repositories\RoleRepository;
use App\Services\Interfaces\RoleServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class RoleService extends BaseService implements RoleServiceInterface
{
    /**
     * RoleService constructor.
     *
     * @param RoleRepository $roleRepository
     */
    public function __construct(RoleRepository $roleRepository)
    {
        parent::__construct($roleRepository);
    }

    /**
     * @param User $user
     * @return Collection
     */
    public function userRoles(User $user): Collection
    {
        $priorityHigherRoles = $user->priorityHigherRoles();
        return empty($priorityHigherRoles)  // The user is Administrator
            ? $this->modelRepository->allRoleNames()
            : $this->modelRepository->roleNamesExpectRoles($priorityHigherRoles);
    }

    /**
     * @param array $roleNames
     * @return array
     */
    public function roleIdsByNames(array $roleNames): array
    {
       return $this->modelRepository->roleIdsByNames($roleNames);
    }

    /**
     * @param array $roleNames
     * @return array
     */
    public function roleIdsByNamesAndNotHighestRole(array $roleNames): array
    {
        return $this->modelRepository->roleIdsByNamesAndNotHighestRole($roleNames);
    }

    /**
     * @return mixed
     */
    public function getLowestRolePriority()
    {
        $role = $this->modelRepository->getLowestRole();
        return $role->priority;
    }

    /**
     * @param UserRoleListRequest $request
     * @return array|LengthAwarePaginator
     */
    public function rolesData(UserRoleListRequest $request)
    {
        $rolesQuery = $this->modelRepository->queryRolesPermissionsUsersCount();
        return $this->getRolesDataByQuery($request, $rolesQuery);
    }

    /**
     * @return mixed
     */
    public function getMainRoles()
    {
        return $this->modelRepository->getMainRoles();
    }

    /**
     * @param int $roleId
     * @param int $page
     * @param int $perPage
     * @return mixed
     */
    public function getMemberList(int $roleId, $page = 1, $perPage = 10)
    {
        return $this->modelRepository->getMemberList($roleId, $page, $perPage);
    }

    /**
     * @param $role
     * @param array $defaultPermissions
     * @return mixed
     */
    public function syncDefaultPermissions($role, $defaultPermissions = [])
    {
        return $role->syncPermissions($defaultPermissions);
    }

    /**
     * @param $role
     * @return mixed
     */
    public function getAllPermissions($role)
    {
        return $role->getAllPermissions()->pluck('name');
    }

    /**
     * @param int $roleId
     * @return mixed
     */
    public function getAllUserList(int $roleId)
    {
        return $this->modelRepository->getAllUserList($roleId);
    }

    /**
     * @param int $roleId
     * @param array $userIds
     * @return mixed
     */
    public function assignUsersToRole(int $roleId, array $userIds)
    {
        return $this->modelRepository->assignUsersToRole($roleId, $userIds);
    }

    /**
     * @param int $roleId
     * @param array $userIds
     * @return mixed
     */
    public function removeUsersFromRole(int $roleId, array $userIds)
    {
        return $this->modelRepository->removeUsersFromRole($roleId, $userIds);
    }
}
