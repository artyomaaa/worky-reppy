<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;

interface UserProjectRoleRepositoryInterface
{
    /**
     * Get All User Project Roles Name.
     * @return array
     */
    public function allUserProjectRolesName(): array;

    /**
     * Get All User Project Roles.
     * @param array $names
     * @param array $select
     * @return Collection
     */
    public function userProjectRolesByNames(array $names, array $select): Collection;

    /**
     * @return QueryBuilder
     */
    public function queryRolesPermissionsUsersCount(): QueryBuilder;

    /**
     * @param int $roleId
     * @param int $page
     * @param int $perPage
     * @return mixed
     */
    public function getMemberList(int $roleId, $page = 1, $perPage = 10);

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
