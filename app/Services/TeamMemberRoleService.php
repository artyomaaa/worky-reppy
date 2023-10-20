<?php

namespace App\Services;

use App\Http\Requests\UserRoleListRequest;
use App\Repositories\TeamMemberRoleRepository;
use App\Services\Interfaces\TeamMemberRoleServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TeamMemberRoleService extends BaseService implements TeamMemberRoleServiceInterface
{
    /**
     * TeamMemberRoleService constructor.
     *
     * @param TeamMemberRoleRepository $teamMemberRoleRepository
     */
    public function __construct(TeamMemberRoleRepository $teamMemberRoleRepository)
    {
        parent::__construct($teamMemberRoleRepository);
    }

    /**
     * @return array
     */
    public function roleNames(): array
    {
        return $this->modelRepository->roleNames();
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
}
