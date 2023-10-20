<?php

namespace App\Services\Interfaces;

use App\Http\Requests\UserRoleListRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TeamMemberRoleServiceInterface
{
    /**
     * @return array
     */
    public function roleNames(): array;

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
}
