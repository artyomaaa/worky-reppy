<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\UserProjectRole;
use App\Repositories\Interfaces\UserProjectRoleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;

class UserProjectRoleRepository extends BaseRepository implements UserProjectRoleRepositoryInterface
{
    /**
     * UserProjectRoleRepository constructor.
     *
     * @param UserProjectRole $model
     */
    public function __construct(UserProjectRole $model)
    {
        parent::__construct($model);
    }

    /**
     * Get All User Project Roles Name.
     * @return array
     */
    public function allUserProjectRolesName(): array
    {
        return $this->model->all()->pluck('name')->toArray();
    }

    /**
     * Get All User Project Roles.
     * @param array $names
     * @param array $select
     * @return Collection
     */
    public function userProjectRolesByNames(array $names, array $select): Collection
    {
        return $this->model->whereIn('name', $names)->get($select);
    }

    /**
     * @return QueryBuilder
     */
    public function queryRolesPermissionsUsersCount(): QueryBuilder
    {
        return \DB::table('user_project_roles')
            ->select('user_project_roles.id', 'user_project_roles.name', \DB::raw("DATE(user_project_roles.created_at) AS created_at"), 'mhr.users_count', 'rhp.permissions_count')
            ->leftJoin(\DB::raw("
            (SELECT user_project_roles.id AS role_id, COUNT(up.user_id) AS users_count FROM user_project_roles
                            LEFT JOIN user_projects up ON user_project_roles.id = up.user_project_role_id
                            LEFT JOIN users u ON u.id = up.user_id
                            WHERE u.status = 1 AND up.status = 1
                            GROUP BY user_project_roles.id) AS mhr
            "), 'user_project_roles.id', '=', 'mhr.role_id')
            ->leftJoin(\DB::raw("
            (SELECT user_project_roles.id AS role_id, COUNT(rhp.permission_id) AS permissions_count FROM user_project_roles
                             LEFT JOIN model_has_permissions rhp ON user_project_roles.id = rhp.model_id
                             WHERE rhp.model_type = 'App\\\Models\\\UserProjectRole'
                             GROUP BY user_project_roles.id) AS rhp
            "), 'user_project_roles.id', '=', 'rhp.role_id');
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
        return \DB::table('user_projects')
            ->select(
                'user_project_role_id as role_id',
                'users.id',
                'users.name',
                'users.surname',
                'users.avatar',)
            ->join('users', 'users.id', '=', 'user_projects.user_id')
            ->where('user_projects.status', 1) // only active members
            ->where('user_project_role_id', $roleId)
            ->groupBy('users.id')
            ->get();
    }

    /**
     * @param int $roleId
     * @return mixed
     */
    public function getAllUserList(int $roleId)
    {
        $users = \DB::table('users')
            ->where('users.status', User::ACTIVE['value'])
            ->select('users.id', 'users.name', 'users.surname', 'users.avatar', \DB::raw('null as role_id'))
            ->get();

        $usersProjectRoles = \DB::table('users')
            ->leftJoin('user_projects', 'users.id', '=', 'user_projects.user_id')
            ->where('users.status', User::ACTIVE['value'])
            ->select('users.id', 'users.name', 'users.surname', 'users.avatar', 'user_projects.user_project_role_id as role_id')
            ->get();


        // TODO maybe need to improve
        foreach ($users as $user){
            foreach ($usersProjectRoles as $k=>$upr){
                if ($user->id === $upr->id) {
                    if ($upr->role_id === $roleId) {
                        $user->role_id = $roleId;
                    }
                    unset($usersProjectRoles[$k]); // Need to unset for big data
                }
            }
        }

        return $users;
    }

    /**
     * @param string $roleName
     * @return mixed
     */
    public function findByName(string $roleName)
    {
        return $this->model->where('name', $roleName)->first();
    }
}
