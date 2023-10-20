<?php

namespace App\Models;

use Spatie\Permission\Models\Role as RoleModel;
use Illuminate\Database\Eloquent\Model;

class Role extends RoleModel
{
    const ADMINISTRATOR = 'Administrator';
    const HUMAN_RESOURCES_MANAGER = 'Human Resources Manager';
    const MANAGER = 'Manager';
    const STAFF = 'Staff';

    const DEFAULT_STAFF_PERMISSIONS  = [
        'view projects',
        'view self projects',
        'view teams',
        'view reports',
        'view self project member list',
        'view team user report list',
        'view project time reports',
        'export project time reports',
        'view user report full list',
        'view users',
        'view user details',
        'view self details',
        'edit self users',
        'view works',
        'add works',
        'edit works',
        'delete works',
        'view tags',
        'add tags',
        'edit tags',
        'delete tags',
        'view todos',
        'add todos',
        'edit todos',
        'delete todos',
        'view self contacts',
        'add self contacts',
        'edit self contacts',
        'delete self contacts',
        'view self documents',
        'add self documents',
        'edit self documents',
        'delete self documents',
        'view self salary',
        'view self bonus',
        'view self job information',
        'view family information',
        'view self relative',
        'add self relative',
        'edit self relative',
        'delete self relative',
        'view self remuneration',
        'add note',
        'edit note',
        'delete note',
        'view self vacation',
        'add self vacation',
        'edit self vacation',
        'delete self vacation',
        'view self day note',
        'add self day note',
        'edit self day note',
        'delete self day note',
        'view self education',
        'add self education',
        'edit self education',
        'delete self education',
        'upload self avatar',
        'view self weekly activity',
        'add google calendar events',
        'edit google calendar events',
        'view user casual',
        'view self other spends',
        'delete self other spends',
        'edit self other spends',
        'add self other spends',
        'add self bonus',
        'edit self bonus',
        'delete self bonus',
        'add self salary',
        'edit self salary',
        'delete self salary',
        'view self teams',
        'edit self teams',
        'delete self teams',
    ];
    const DEFAULT_MANAGER_PERMISSIONS  = [
        'view users',
        'view user details',
        'view self details',
        'add users',
        'view projects',
        'view self projects',
        'edit self users',
        'add projects',
        'edit projects',
        'view works',
        'add works',
        'edit works',
        'delete works',
        'view tags',
        'add tags',
        'edit tags',
        'delete tags',
        'view todos',
        'add todos',
        'edit todos',
        'delete todos',
        'view teams',
        'edit self teams',
        'view self teams',
        'delete self teams',
        'view reports',
        'view team project member list',
        'view team user report list',
        'view project time reports',
        'export project time reports',
        'view user report full list',
        'export user data',
        'view self contacts',
        'add self contacts',
        'edit self contacts',
        'delete self contacts',
        'view self documents',
        'add self documents',
        'edit self documents',
        'delete self documents',
        'view self salary',
        'view self bonus',
        'view self job information',
        'view family information',
        'view relative',
        'view self relative',
        'add self relative',
        'edit self relative',
        'delete self relative',
        'view self remuneration',
        'add note',
        'edit note',
        'delete note',
        'view self vacation',
        'add self vacation',
        'edit self vacation',
        'delete self vacation',
        'view self day note',
        'add self day note',
        'edit self day note',
        'delete self day note',
        'view self education',
        'add self education',
        'edit self education',
        'delete self education',
        'upload self avatar',
        'view self weekly activity',
        'add google calendar events',
        'edit google calendar events',
        'view user casual',
        'view self other spends',
        'delete self other spends',
        'edit self other spends',
        'add self other spends',
        'add self bonus',
        'edit self bonus',
        'delete self bonus',
        'add self salary',
        'edit self salary',
        'delete self salary',
    ];
    const DEFAULT_HUMAN_RESOURCES_MANAGER_PERMISSIONS = [
        'view users',
        'view user details',
        'view self details',
        'add users',
        'edit users',
        'edit self users',
        'delete users',
        'view projects',
        'view self projects',
        'add projects',
        'edit projects',
        'delete projects',
        'view works',
        'add works',
        'edit works',
        'delete works',
        'view tags',
        'add tags',
        'edit tags',
        'delete tags',
        'view todos',
        'add todos',
        'edit todos',
        'delete todos',
        'view teams',
        'add teams',
        'edit teams',
        'delete teams',
        'view team details',
        'view specific team details',
        'view self team details',
        'edit self teams',
        'view self teams',
        'delete self teams',
        'view reports',
        'view project member list',
        'view projects list',
        'view team user report list',
        'view team user report full list',
        'view project time reports',
        'export project time reports',
        'view user report full list',
        'view documents',
        'add documents',
        'edit documents',
        'delete documents',
        'view self documents',
        'add self documents',
        'edit self documents',
        'delete self documents',
        'export user data',
        'view contacts',
        'add contacts',
        'edit contacts',
        'delete contacts',
        'view self contacts',
        'add self contacts',
        'edit self contacts',
        'delete self contacts',
        'view self salary',
        'view salary',
        'add salary',
        'delete salary',
        'edit salary',
        'view self bonus',
        'view bonus',
        'add bonus',
        'edit bonus',
        'delete bonus',
        'view job information',
        'edit job information',
        'add job information',
        'delete job information',
        'view self job information',
        'edit self job information',
        'add self job information',
        'delete self job information',
        'view family information',
        'edit family information',
        'view relative',
        'add relative',
        'edit relative',
        'delete relative',
        'view self relative',
        'add self relative',
        'edit self relative',
        'delete self relative',
        'view remuneration',
        'view self remuneration',
        'add note',
        'edit note',
        'delete note',
        'view self remuneration',
        'view vacation',
        'add vacation',
        'edit vacation',
        'delete vacation',
        'view self vacation',
        'add self vacation',
        'edit self vacation',
        'delete self vacation',
        'view day note',
        'add day note',
        'edit day note',
        'delete day note',
        'view self day note',
        'add self day note',
        'edit self day note',
        'delete self day note',
        'view education',
        'add education',
        'edit education',
        'delete education',
        'view self education',
        'add self education',
        'edit self education',
        'delete self education',
        'edit job type',
        'edit self job type',
        'upload avatar',
        'upload self avatar',
        'view self weekly activity',
        'view others google calendar connection',
        'view others google auth url',
        'add others google calendar token',
        'remove others google calendar token',
        'add google calendar events',
        'edit google calendar events',
        'view others full calendar',
        'view user casual',
        'add user casual',
        'edit user casual',
        'delete user casual',
        'view other spends',
        'add other spends',
        'edit other spends',
        'delete other spends',
        'view self other spends',
        'delete self other spends',
        'edit self other spends',
        'add self other spends',
        'add self bonus',
        'edit self bonus',
        'delete self bonus',
        'add self salary',
        'edit self salary',
        'delete self salary',
    ];

    protected $guard_name = 'api';

    /**
     * @return Model
     */
    public static function getHighestRole(): Model
    {
        return self::orderBy('priority')->first(); // priority = 1 has all access/permissions
    }

    /**
     * @return Model
     */
    public static function getLowestRole(): Model
    {
        return self::orderBy('priority', 'desc')->first();
    }

    /**
     * @return string
     */
    public static function getHighestRoleName()
    {
        $role = self::getHighestRole();
        return !empty($role) ? $role->name : "";
    }
}