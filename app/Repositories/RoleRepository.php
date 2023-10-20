<?php

namespace App\Repositories;

use App\Models\Role;
use App\Models\User;
use App\Repositories\Interfaces\RoleRepositoryInterface;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface
{

    /**
     * UserRepository constructor.
     *
     * @param Role $model
     */
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection
     */
    public function allRoleNames(): Collection
    {
        return $this->model->all()->pluck('name');
    }

    /**
     * @param array $expectRoleNames
     * @return Collection
     */
    public function roleNamesExpectRoles(array $expectRoleNames): Collection
    {
        return $this->model->whereNotIn('name', $expectRoleNames)->pluck('name');
    }

    /**
     * @param array $roleNames
     * @return array
     */
    public function roleIdsByNames(array $roleNames): array
    {
        return $this->model->whereIn('name', $roleNames)->pluck('id')->toArray();
    }

    /**
     * @param array $roleNames
     * @return array
     */
    public function roleIdsByNamesAndNotHighestRole(array $roleNames): array
    {
        return $this->model->where('name', '!=', Role::getHighestRoleName())->whereIn('name', $roleNames)->pluck('id')->toArray();
    }

    /**
     * @return QueryBuilder
     */
    public function queryRolesPermissionsUsersCount(): QueryBuilder
    {
        return \DB::table('roles')
            ->select('roles.id', 'roles.name', \DB::raw("DATE(roles.created_at) AS created_at"), 'mhr.users_count', 'rhp.permissions_count')
            ->leftJoin(\DB::raw("
            (SELECT roles.id AS role_id, COUNT(mhr.model_id) AS users_count FROM roles
                               LEFT JOIN model_has_roles mhr ON roles.id = mhr.role_id
                               LEFT JOIN users u ON u.id = mhr.model_id
                            WHERE mhr.model_type = 'App\\\Models\\\User' AND u.status = 1
                            GROUP BY roles.id) AS mhr
            "), 'roles.id', '=', 'mhr.role_id')
            ->leftJoin(\DB::raw("
            (SELECT roles.id AS role_id, COUNT(rhp.permission_id) AS permissions_count FROM roles
                                    LEFT JOIN role_has_permissions rhp ON roles.id = rhp.role_id
                             GROUP BY roles.id) AS rhp
            "), 'roles.id', '=', 'rhp.role_id');
    }

    /**
     * @return Model
     */
    public function getLowestRole(): Model
    {
        return $this->model->getLowestRole();
    }

    /**
     * @return mixed
     */
    public function getMainRoles()
    {
        // The main roles and they cannot be deleted
        $names = [Role::ADMINISTRATOR, Role::HUMAN_RESOURCES_MANAGER, Role::MANAGER, Role::STAFF];
        return $this->model->whereIn('name', $names)->get();
    }

    /**
     * @param int $roleId
     * @param int $page
     * @param int $perPage
     * @return mixed
     */
    public function getMemberList(int $roleId, $page = 1, $perPage = 10)
    {
        // TODO originally worked with pages
//        $page = !empty($page) ? $page : 1;
//        $perPage = !empty($perPage) ? $perPage : config('app.default_per_page');
        $tbName = config('permission.table_names.model_has_roles');
        return \DB::table($tbName)
            ->select
            (
                $tbName . '.role_id',
                'users.id',
                'users.name',
                'users.surname',
                'users.avatar'
            )
            ->join('users', 'users.id', '=', $tbName . '.model_id')
            ->where('users.status', User::ACTIVE['value'])
            ->where('role_id', $roleId)
            ->where('model_type', 'App\Models\User')
            ->groupBy('users.id')
            ->get();
    }

    /**
     * @param int $roleId
     * @return mixed
     */
    public function getAllUserList(int $roleId)
    {
        $tbName = config('permission.table_names.model_has_roles');
        return \DB::table('users')
            ->leftJoin($tbName, 'users.id', '=', $tbName . '.model_id')
            ->where('users.status', User::ACTIVE['value'])
            ->where(function ($q) use($tbName) {
                $q->where($tbName . '.model_type', 'App\Models\User');
                $q->orWhereNull($tbName . '.model_type');
            })
            ->select('users.id', 'users.name', 'users.surname', 'users.avatar', $tbName . '.role_id')
            ->groupBy('users.id')
            ->get();
    }

    /**
     * @param int $roleId
     * @param array $userIds
     * @return mixed
     */
    public function assignUsersToRole(int $roleId, array $userIds)
    {
        return User::whereIn('id', $userIds)
            ->get()
            ->each(function ($user) use($roleId) {
                $user->syncRoles([$roleId]); // todo allowing only one role per user
            });
    }

    /**
     * @param int $roleId
     * @param array $userIds
     * @return mixed
     */
    public function removeUsersFromRole(int $roleId, array $userIds)
    {
        return User::whereIn('id', $userIds)
            ->get()
            ->each(function ($user) use($roleId) {
                $user->removeRole($roleId);
            });
    }
}
