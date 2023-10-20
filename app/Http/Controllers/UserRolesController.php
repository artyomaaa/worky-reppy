<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddDefaultPermissionsToRoleRequest;
use App\Http\Requests\AddPermissionToRoleRequest;
use App\Http\Requests\RemovePermissionFromRoleRequest;
use App\Http\Requests\UserRoleAssignUsersToRoleRequest;
use App\Http\Requests\UserRoleDeleteRequest;
use App\Http\Requests\UserRoleShowRequest;
use App\Http\Requests\UserRoleStoreRequest;
use App\Http\Requests\UserRoleUpdateRequest;
use App\Http\Requests\UserRoleUserListRequest;
use App\Models\Permission;
use App\Services\Interfaces\PermissionServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use \App\Services\PermissionService;
use App\Services\Interfaces\RoleServiceInterface;
use App\Services\Interfaces\TeamMemberRoleServiceInterface;
use App\Services\Interfaces\UserProjectRoleServiceInterface;
use App\Http\Requests\UserRoleListRequest;
use Illuminate\Http\JsonResponse;
use App\Models\Role;

class UserRolesController extends Controller
{
    /**
     * @var PermissionService
     */
    private $permissionService;
    /**
     * @var RoleServiceInterface
     */
    private $roleService;

    /**
     * @var TeamMemberRoleServiceInterface
     */
    private $teamMemberRoleService;

    /**
     * @var UserProjectRoleServiceInterface
     */
    private $userProjectRoleService;

    /**
     * @var UserServiceInterface
     */
    private $userService;


    /**
     * UsersController constructor.
     * @param PermissionServiceInterface $permissionService
     * @param RoleServiceInterface $roleService
     * @param TeamMemberRoleServiceInterface $teamMemberRoleService
     * @param UserProjectRoleServiceInterface $userProjectRoleService
     * @param UserServiceInterface $userService
     */
    public function __construct(
        PermissionServiceInterface $permissionService,
        RoleServiceInterface $roleService,
        TeamMemberRoleServiceInterface $teamMemberRoleService,
        UserProjectRoleServiceInterface $userProjectRoleService,
        UserServiceInterface $userService
    ) {
        $this->permissionService = $permissionService;
        $this->roleService = $roleService;
        $this->teamMemberRoleService = $teamMemberRoleService;
        $this->userProjectRoleService = $userProjectRoleService;
        $this->userService = $userService;
    }

    /**
     * Display the specified resource.
     *
     * @param  UserRoleShowRequest  $request
     * @return mixed
     */
    public function show(UserRoleShowRequest $request)
    {
        $role = null;
        $loggedUser = $request->user();
        if (!$loggedUser->can('view roles permissions')) {
            return response()->json(['status' => false, 'message' => __('messages.access_denied'), 'role' => null]);
        }

        switch ($request->role_type) {
            case 'company':
                $role = $this->roleService->find($request->id);
                if ($role) {
                    $role->memberList = $this->roleService->getMemberList($role->id, $request->users_page, $request->users_per_pae);
                    $userIds = $role->memberList->pluck('id')->toArray();
                    $positionUsers = $this->userService->getUserPositionsByUserIds($userIds);
                    foreach ($role->memberList as $value) {
                        foreach ($positionUsers as $userPosition) {
                            if ($value->id == $userPosition->user_id) {
                                $value->position = $userPosition->position;
                                break;
                            }
                        }
                    }
                    $role->permissionList = $this->roleService->getAllPermissions($role);
                }
                break;
            case 'team':
                $role = $this->teamMemberRoleService->find($request->id);
                if ($role) {
                    $role->memberList = $this->teamMemberRoleService->getMemberList($role->id, $request->users_page, $request->users_per_pae);
                    $userIds = $role->memberList->pluck('id')->toArray();
                    $positionUsers = $this->userService->getUserPositionsByUserIds($userIds);
                    foreach ($role->memberList as $value) {
                        foreach ($positionUsers as $userPosition) {
                            if ($value->id == $userPosition->user_id) {
                                $value->position = $userPosition->position;
                                break;
                            }
                        }
                    }
                    $role->permissionList = $this->teamMemberRoleService->getAllPermissions($role);
                }
                break;
            case 'project':
                $role = $this->userProjectRoleService->find($request->id);
                if ($role) {
                    $role->memberList = $this->userProjectRoleService->getMemberList($role->id, $request->users_page, $request->users_per_pae);
                    $userIds = $role->memberList->pluck('id')->toArray();
                    $positionUsers = $this->userService->getUserPositionsByUserIds($userIds);
                    foreach ($role->memberList as $value) {
                        foreach ($positionUsers as $userPosition) {
                            if ($value->id == $userPosition->user_id) {
                                $value->position = $userPosition->position;
                                break;
                            }
                        }
                    }
                    $role->permissionList = $this->userProjectRoleService->getAllPermissions($role);
                }
                break;
        }

        if(isset($role->permissions)) unset($role->permissions); // No Need big data here

        return response()->json(['status' => true, 'message' => __('messages.getting_role_success'), 'role' => $role]);
    }

    /**
     * @param UserRoleStoreRequest $request
     * @return JsonResponse
     */
    public function store(UserRoleStoreRequest $request): JsonResponse
    {
        $role = null;
        $loggedUser = $request->user();
        if ($loggedUser->can('add roles permissions')) {
            $data = [
                'name' => $request->name,
                'description' => $request->description,
            ];

            switch ($request->role_type) {
                case 'company':
                    $data['priority'] = $this->roleService->getLowestRolePriority() + 1;
                    $role = $this->roleService->add($data);
                    if (!empty($role)) {
                        $this->roleService->syncDefaultPermissions($role, Role::DEFAULT_STAFF_PERMISSIONS);
                        $role->permissionList = $this->roleService->getAllPermissions($role);
                    }
                    break;
                case 'team':
                    $role = $this->teamMemberRoleService->add($data);
                    if (!empty($role)) {
                        $this->teamMemberRoleService->syncDefaultPermissions($role, Role::DEFAULT_STAFF_PERMISSIONS);
                        $role->permissionList = $this->teamMemberRoleService->getAllPermissions($role);
                    }
                    break;
                case 'project':
                    $role = $this->userProjectRoleService->add($data);
                    if (!empty($role)) {
                        $this->userProjectRoleService->syncDefaultPermissions($role, Role::DEFAULT_STAFF_PERMISSIONS);
                        $role->permissionList = $this->userProjectRoleService->getAllPermissions($role);
                    }
                    break;
            }
        }

        if(isset($role->permissions)) unset($role->permissions); // No Need big data here

        return response()->json([
            'status' => true,
            'message' => __('messages.role_added'),
            'role' => $role,
        ]);
    }

    /**
     * @param UserRoleUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UserRoleUpdateRequest $request, int $id): JsonResponse
    {
        $role = null;
        $loggedUser = $request->user();
        if ($loggedUser->can('update roles permissions')) {
            $data = [
                'name' => $request->name,
                'description' => $request->description,
            ];
            switch ($request->role_type) {
                case 'company':
                    if ($this->roleService->edit($data, $id)) {
                        $role = $this->roleService->find($id);
                    }
                    break;
                case 'team':
                    if ($this->teamMemberRoleService->edit($data, $id)) {
                        $role = $this->teamMemberRoleService->find($id);
                    }
                    break;
                case 'project':
                    if ($this->userProjectRoleService->edit($data, $id)) {
                        $role = $this->userProjectRoleService->find($id);
                    }
                    break;
            }
        }
        return response()->json([
            'status' => true,
            'message' => __('messages.role_updated'),
            'role' => $role
        ]);
    }

    /**
     * @param UserRoleDeleteRequest $request
     * @param int $id
     * @return JsonResponse
     * @throws \Exception
     */
    public function destroy(UserRoleDeleteRequest $request, int $id): JsonResponse
    {
        $deleted = false;
        $loggedUser = $request->user();
        if ($loggedUser->can('delete roles permissions')) {
            switch ($request->role_type) {
                case 'company':
                    $mainRoleIds = $this->roleService->getMainRoles()->pluck('id')->toArray();
                    if (!in_array($id, $mainRoleIds)) {
                        $deleted = $this->roleService->delete($id);
                    }
                    break;
                case 'team':
                    $deleted = $this->teamMemberRoleService->delete($id);
                    break;
                case 'project':
                    $deleted = $this->userProjectRoleService->delete($id);
                    break;
            }
        }
        if (!$deleted) {
            return response()->json([
                'status' => false,
                'message' => __('messages.something_went_wrong')
            ]);
        }
        return response()->json([
            'status' => true,
            'message' => __('messages.role_deleted')
        ]);
    }

    /**
     * Display a listing of the resource.
     * @param UserRoleListRequest $request
     * @return JsonResponse
     */
    public function roles(UserRoleListRequest $request): JsonResponse
    {
        $roles = [];
        $loggedUser = $request->user();
        if ($loggedUser->can('view roles permissions')) {
            switch ($request->role_type) {
                case 'company':
                    $roles = $this->roleService->rolesData($request);
                    break;
                case 'team':
                    $roles = $this->teamMemberRoleService->rolesData($request);
                    break;
                case 'project':
                    $roles = $this->userProjectRoleService->rolesData($request);
                    break;
            }
        }

        return response()->json([
            'status' => true,
            'message' => __('messages.getting_roles'),
            'roles' => $roles
        ]);
    }

    /**
     * Display a listing of the resource.
     * @param AddPermissionToRoleRequest $request
     * @return JsonResponse
     */
    public function addPermissionToRole(AddPermissionToRoleRequest $request): JsonResponse
    {
        $role = null;
        $loggedUser = $request->user();
        if (!$loggedUser->can('add permission to role')) {
            return response()->json(['status' => false, 'message' => __('messages.access_denied'), 'role' => null]);
        }

        $role_id = $request->role_id;
        $permission = $this->permissionService->getItemByName($request->permission);
        if (empty($permission)) {
            return response()->json(['status' => false, 'message' => __('messages.invalid_permission'), 'role' => null]);
        }
        switch ($request->role_type) {
            case 'company':
                $role = $this->roleService->find($role_id);
                if (!empty($role)) {
                    $role->givePermissionTo($permission->name);
                    $role->permissionList = $this->roleService->getAllPermissions($role);
                }
                break;
            case 'team':
                $role = $this->teamMemberRoleService->find($role_id);
                if (!empty($role)) {
                    $role->givePermissionTo($permission->name);
                    $role->permissionList = $this->teamMemberRoleService->getAllPermissions($role);
                }
                break;
            case 'project':
                $role = $this->userProjectRoleService->find($role_id);
                if (!empty($role)) {
                    $role->givePermissionTo($permission->name);
                    $role->permissionList = $this->userProjectRoleService->getAllPermissions($role);
                }
                break;
        }
        if(isset($role->permissions)) unset($role->permissions); // No Need big data here
        return response()->json([
            'status' => true,
            'message' => __('messages.added_permission_to_role'),
            'role' => $role
        ]);
    }


    /**
     * Display a listing of the resource.
     * @param RemovePermissionFromRoleRequest $request
     * @return JsonResponse
     */
    public function removePermissionFromRole(RemovePermissionFromRoleRequest $request): JsonResponse
    {
        $role = null;
        $loggedUser = $request->user();
        if (!$loggedUser->can('remove permission from role')) {
            return response()->json(['status' => false, 'message' => __('messages.access_denied'), 'role' => null]);
        }
        $role_id = $request->role_id;
        $permission = $this->permissionService->getItemByName($request->permission);
        if (empty($permission)) {
            return response()->json(['status' => false, 'message' => __('messages.invalid_permission'), 'role' => null]);
        }
        switch ($request->role_type) {
            case 'company':
                $role = $this->roleService->find($role_id);
                if (!empty($role)) {
                    $role->revokePermissionTo($permission->name);
                    $role->permissionList = $this->roleService->getAllPermissions($role);
                }
                break;
            case 'team':
                $role = $this->teamMemberRoleService->find($role_id);
                if (!empty($role)) {
                    $role->revokePermissionTo($permission->name);
                    $role->permissionList = $this->teamMemberRoleService->getAllPermissions($role);
                }
                break;
            case 'project':
                $role = $this->userProjectRoleService->find($role_id);
                if (!empty($role)) {
                    $role->revokePermissionTo($permission->name);
                    $role->permissionList = $this->userProjectRoleService->getAllPermissions($role);
                }
                break;
        }

        if(isset($role->permissions)) unset($role->permissions); // No Need big data here

        return response()->json([
            'status' => true,
            'message' => __('messages.removed_permission_from_role'),
            'role' => $role
        ]);
    }

    /**
     * Display a listing of the resource.
     * @param AddDefaultPermissionsToRoleRequest $request
     * @return JsonResponse
     */
    public function addDefaultPermissionsToRole(AddDefaultPermissionsToRoleRequest $request): JsonResponse
    {
        $role = null;
        $loggedUser = $request->user();
        if (!$loggedUser->can('add permission to role')) {
            return response()->json(['status' => false, 'message' => __('messages.access_denied'), 'role' => null]);
        }

        $role_id = $request->role_id;
        $defaultPermissions = [];
        switch ($request->role_name) {
            case Role::STAFF:
                $defaultPermissions = Role::DEFAULT_STAFF_PERMISSIONS;
                break;
            case Role::MANAGER:
                $defaultPermissions = Role::DEFAULT_MANAGER_PERMISSIONS;
                break;
            case Role::HUMAN_RESOURCES_MANAGER:
                $defaultPermissions = Role::DEFAULT_HUMAN_RESOURCES_MANAGER_PERMISSIONS;
                break;
            case Role::ADMINISTRATOR:
                $defaultPermissions = Permission::all();
                break;
        }
        switch ($request->role_type) {
            case 'company':
                $role = $this->roleService->find($role_id);
                if (!empty($role)) {
                    $this->roleService->syncDefaultPermissions($role, $defaultPermissions);
                    $role->permissionList = $this->roleService->getAllPermissions($role);
                }
                break;
            case 'team':
                $role = $this->teamMemberRoleService->find($role_id);
                if (!empty($role)) {
                    $this->teamMemberRoleService->syncDefaultPermissions($role, $defaultPermissions);
                    $role->permissionList = $this->teamMemberRoleService->getAllPermissions($role);
                }
                break;
            case 'project':
                $role = $this->userProjectRoleService->find($role_id);
                if (!empty($role)) {
                    $this->userProjectRoleService->syncDefaultPermissions($role, $defaultPermissions);
                    $role->permissionList = $this->userProjectRoleService->getAllPermissions($role);
                }
                break;
        }
        if(isset($role->permissions)) unset($role->permissions); // No Need big data here
        return response()->json([
            'status' => true,
            'message' => __('messages.added_permissions_to_role'),
            'role' => $role
        ]);
    }

    /**
     * Display a listing of the resource.
     * @param UserRoleUserListRequest $request
     * @return JsonResponse
     */
    public function getAllUserList(UserRoleUserListRequest $request): JsonResponse
    {
        $users = [];
        $loggedUser = $request->user();
        if (!$loggedUser->can('view roles permissions')) {
            return response()->json(['status' => false, 'message' => __('messages.access_denied'), 'userList' => null]);
        }

        switch ($request->role_type) {
            case 'company':
                $users = $this->roleService->getAllUserList($request->role_id);
                break;
            case 'team':
                $users = $this->teamMemberRoleService->getAllUserList($request->role_id);
                break;
            case 'project':
                $users = $this->userProjectRoleService->getAllUserList($request->role_id);
                break;
        }

        return response()->json([
            'status' => true,
            'message' => __('messages.getting_user_list'),
            'userList' => $users
        ]);
    }

    /**
     * Display a listing of the resource.
     * @param UserRoleAssignUsersToRoleRequest $request
     * @return JsonResponse
     */
    public function assignUsersToRole(UserRoleAssignUsersToRoleRequest $request): JsonResponse
    {
        $users = [];
        $loggedUser = $request->user();
        if (!$loggedUser->can('view roles permissions')) {
            return response()->json(['status' => false, 'message' => __('messages.access_denied'), 'userList' => null]);
        }
        switch ($request->role_type) {
            case 'company':
                $this->roleService->assignUsersToRole($request->role_id, $request->added_user_ids);
                $this->roleService->removeUsersFromRole($request->role_id, $request->removed_user_ids);
                break;
            case 'team':
//                $this->teamMemberRoleService->assignUsersToRole($request->role_id, $request->added_user_ids);
//                $this->teamMemberRoleService->removeUsersFromRole($request->role_id, $request->removed_user_ids);
                break;
            case 'project':
//                $this->userProjectRoleService->assignUsersToRole($request->role_id, $request->added_user_ids);
//                $this->userProjectRoleService->removeUsersFromRole($request->role_id, $request->removed_user_ids);
                break;
        }

        return response()->json([
            'status' => true,
            'message' => __('messages.getting_user_list'),
            'userList' => $users
        ]);
    }
}
