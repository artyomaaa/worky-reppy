<?php

namespace App\Repositories;

use App\Models\TeamMemberRole;
use App\Models\User;
use App\Repositories\Interfaces\TeamMemberRoleRepositoryInterface;
use Illuminate\Database\Query\Builder as QueryBuilder;

class TeamMemberRoleRepository extends BaseRepository implements TeamMemberRoleRepositoryInterface
{

    /**
     * TeamMemberRoleRepository constructor.
     *
     * @param TeamMemberRole $model
     */
    public function __construct(TeamMemberRole $model)
    {
        parent::__construct($model);
    }

    /**
     * @return array
     */
    public function roleNames(): array
    {
        return $this->model->pluck('name')->toArray();
    }

    /**
     * @return QueryBuilder
     */
    public function queryRolesPermissionsUsersCount(): QueryBuilder
    {
        return \DB::table('team_member_roles')
            ->select('team_member_roles.id', 'team_member_roles.name', \DB::raw("DATE(team_member_roles.created_at) AS created_at"), 'mhr.users_count', 'rhp.permissions_count')
            ->leftJoin(\DB::raw("
            (SELECT team_member_roles.id AS role_id, COUNT(mhr.user_id) AS users_count FROM team_member_roles
                            LEFT JOIN team_members mhr ON team_member_roles.id = mhr.team_member_role_id
                            LEFT JOIN users u ON u.id = mhr.user_id
                            WHERE u.status = 1
                            GROUP BY team_member_roles.id) AS mhr
            "), 'team_member_roles.id', '=', 'mhr.role_id')
            ->leftJoin(\DB::raw("
            (SELECT team_member_roles.id AS role_id, COUNT(rhp.permission_id) AS permissions_count FROM team_member_roles
                             LEFT JOIN model_has_permissions rhp ON team_member_roles.id = rhp.model_id
                             WHERE rhp.model_type = 'App\\\Models\\\TeamMemberRole'
                             GROUP BY team_member_roles.id) AS rhp
            "), 'team_member_roles.id', '=', 'rhp.role_id');
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
        return \DB::table('team_members')
            ->select(
                'team_member_role_id as role_id',
                'users.id',
                'users.name',
                'users.surname',
                'users.avatar'
            )
            ->join('users', 'users.id', '=', 'team_members.user_id')
            ->where('team_member_role_id', $roleId)
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

        $usersTeamMemberRoles = \DB::table('users')
            ->leftJoin('team_members', 'users.id', '=', 'team_members.user_id')
            ->where('users.status', User::ACTIVE['value'])
            ->select('users.id', 'users.name', 'users.surname', 'users.avatar', 'team_members.team_member_role_id as role_id')
            ->get();


        // TODO maybe need to improve
        foreach ($users as $user){
            foreach ($usersTeamMemberRoles as $k=>$utmr){
                if ($user->id === $utmr->id) {
                    if ($utmr->role_id === $roleId) {
                        $user->role_id = $roleId;
                    }
                    unset($usersTeamMemberRoles[$k]); // Need to unset for big data
                }
            }
        }

        return $users;
    }
}
