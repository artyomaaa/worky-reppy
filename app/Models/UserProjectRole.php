<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasPermissions;
use Spatie\Permission\Traits\RefreshesPermissionCache;

class UserProjectRole extends Model
{
    use HasPermissions;
    use RefreshesPermissionCache;

    protected $fillable = ['name', 'description', 'created_at', 'updated_at'];

    protected $guard_name = 'api';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function userProjects()
    {
        return $this->hasMany('UserProject');
    }

    /**
     * @param $userId
     * @param array|null $projectIds
     * @return array
     */
    public static function userProjectsRolePermissions($userId, array $projectIds = null): array
    {
        $tableNames = config('permission.table_names');
        $itemsQuery = UserProject::join($tableNames['model_has_permissions'], $tableNames['model_has_permissions'] . '.model_id', '=', 'user_projects.user_project_role_id')
            ->join('permissions', $tableNames['model_has_permissions'] . '.permission_id', '=', 'permissions.id')
            ->where('user_projects.status', 1) // only active member
            ->where('user_projects.user_id', $userId)
            ->where($tableNames['model_has_permissions'] . '.model_type', 'App\\Models\\UserProjectRole'); // important

        // TODO maybe need to check by (start_date and end_date) or by status?

        if (!empty($projectIds)) {
            if (!is_array($projectIds)) {
                $projectIds = [$projectIds];
            }
            $itemsQuery->whereIn('user_projects.project_id', $projectIds);
        }

        $items = $itemsQuery
            ->get(['user_projects.project_id', 'permissions.name'])
            ->toArray();

        $permissions = [];
        foreach ($items as $item) {
            $permissions[$item['project_id']][] = $item['name'];
        }
        return $permissions;
    }
}
