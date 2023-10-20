<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Collection;

interface RoleRepositoryInterface
{
    /**
     * @return Collection
     */
    public function allRoleNames(): Collection;

    /**
     * @param array $expectRoleNames
     * @return Collection
     */
    public function roleNamesExpectRoles(array $expectRoleNames): Collection;

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
     * @return QueryBuilder
     */
    public function queryRolesPermissionsUsersCount(): QueryBuilder;

    /**
     * @return mixed
     */
    public function getLowestRole(): Model;

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
