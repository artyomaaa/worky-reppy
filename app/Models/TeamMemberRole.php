<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasPermissions;
use Spatie\Permission\Traits\RefreshesPermissionCache;

class TeamMemberRole extends Model
{
    use HasPermissions;
    use RefreshesPermissionCache;

    protected $fillable = ['name', 'description', 'created_at', 'updated_at'];

    protected $guard_name = 'api';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function teamMembers()
    {
        return $this->hasMany('TeamMember');
    }

    /**
     * @param $userId
     * @param arrray|null $teamIds
     * @return array
     */
    public static function teamMembersRolePermissions($userId, array $teamIds = null): array
    {
        $tableNames = config('permission.table_names');
        $itemsQuery = TeamMember::join($tableNames['model_has_permissions'], $tableNames['model_has_permissions'] . '.model_id', '=', 'team_members.team_member_role_id')
            ->join('permissions', $tableNames['model_has_permissions'] . '.permission_id', '=', 'permissions.id')
            ->where('team_members.user_id', $userId)
            ->where($tableNames['model_has_permissions'] . '.model_type', 'App\\Models\\TeamMemberRole'); // important

        if (!empty($teamIds)) {
            if (!is_array($teamIds)) {
                $teamIds = [$teamIds];
            }
            $itemsQuery->whereIn('team_members.team_id', $teamIds);
        }

        $items = $itemsQuery
            ->get(['team_members.team_id', 'permissions.name'])
            ->toArray();

        $permissions = [];
        foreach ($items as $item) {
            $permissions[$item['team_id']][] = $item['name'];
        }
        return $permissions;
    }
}
