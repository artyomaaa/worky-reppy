<?php

namespace App\Services;

use App\Http\Requests\UserRoleListRequest;
use App\Repositories\UserProjectRoleRepository;
use App\Services\Interfaces\UserProjectRoleServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserProjectRoleService extends BaseService implements UserProjectRoleServiceInterface
{
    /**
     * UserProjectRoleService constructor.
     *
     * @param UserProjectRoleRepository $userProjectRoleRepository
     */
    public function __construct(UserProjectRoleRepository $userProjectRoleRepository)
    {
        parent::__construct($userProjectRoleRepository);
    }

    /**
     * Get All User Project Roles Name.
     * @return array
     */
    public function getAllUserProjectRolesName(): array
    {
        return $this->modelRepository->allUserProjectRolesName();
    }

    /**
     * Get All User Project Roles.
     * @param array $names
     * @param array $select
     * @return Collection
     */
    public function getUserProjectRolesByNames(array $names, array $select): Collection
    {
        return $this->modelRepository->userProjectRolesByNames($names, $select);
    }

    /**
     * Create New User Project Roles.
     * @param $data
     * @return array
     */
    public function createNewUserProjectRoles($data): array
    {
        $projectUserRoleNames = [];
        if (count($data) > 0) {
            $nowTime = Carbon::now();
            $allProjectUserRoleNames = $this->modelRepository->allUserProjectRolesName();
            $projectUserRolesToAdd = [];
            foreach ($data as $newUser) {
                if (!in_array($newUser['userRole'], $allProjectUserRoleNames)) {
                    $projectUserRolesToAdd[] = [
                        'name' => $newUser['userRole'],
                        'created_at' => $nowTime,
                        'updated_at' => $nowTime,
                    ];
                }
                $projectUserRoleNames[] = $newUser['userRole'];
            }

            if (count($projectUserRolesToAdd) > 0) {
                $this->modelRepository->insert($projectUserRolesToAdd);
            }
        }
        return $projectUserRoleNames;
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

    /**
     * @param string $roleName
     * @return mixed
     */
    public function findByName(string $roleName)
    {
        return $this->modelRepository->findByName($roleName);
    }
}
