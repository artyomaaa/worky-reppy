<?php

namespace App\Services\Interfaces;

use App\Http\Requests\UserRoleListRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserProjectRoleServiceInterface
{
    /**
     * Get All User Project Roles Name.
     * @return array
     */
    public function getAllUserProjectRolesName(): array;

    /**
     * Get All User Project Roles.
     * @param array $names
     * @param array $select
     * @return Collection
     */
    public function getUserProjectRolesByNames(array $names, array $select): Collection;

    /**
     * Create New User Project Roles.
     * @param $data
     * @return array
     */
    public function createNewUserProjectRoles($data): array;

    /**
     * @param UserRoleListRequest $request
     * @return array|LengthAwarePaginator
     */
    public function rolesData(UserRoleListRequest $request);

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
     * @param string $roleName
     * @return mixed
     */
    public function findByName(string $roleName);
}
