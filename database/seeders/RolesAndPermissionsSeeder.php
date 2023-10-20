<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use \Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['name' => 'view users', 'guard_name' => 'api']);
        Permission::create(['name' => 'view user details', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self details', 'guard_name' => 'api']);
        Permission::create(['name' => 'add users', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit users', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self users', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete users', 'guard_name' => 'api']);
        Permission::create(['name' => 'export user data', 'guard_name' => 'api']);

        Permission::create(['name' => 'view administrators', 'guard_name' => 'api']);
        Permission::create(['name' => 'add administrators', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit administrators', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete administrators', 'guard_name' => 'api']);

        Permission::create(['name' => 'view projects', 'guard_name' => 'api']);
        Permission::create(['name' => 'add projects', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit projects', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete projects', 'guard_name' => 'api']);
        Permission::create(['name' => 'view project rate', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self projects', 'guard_name' => 'api']);

        Permission::create(['name' => 'view works', 'guard_name' => 'api']);
        Permission::create(['name' => 'add works', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit works', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete works', 'guard_name' => 'api']);

        Permission::create(['name' => 'view tags', 'guard_name' => 'api']);
        Permission::create(['name' => 'add tags', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit tags', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete tags', 'guard_name' => 'api']);

        Permission::create(['name' => 'view todos', 'guard_name' => 'api']);
        Permission::create(['name' => 'add todos', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit todos', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete todos', 'guard_name' => 'api']);

        Permission::create(['name' => 'view teams', 'guard_name' => 'api']);
        Permission::create(['name' => 'add teams', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit teams', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self teams', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete teams', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self teams', 'guard_name' => 'api']);
        Permission::create(['name' => 'view team details', 'guard_name' => 'api']);
        Permission::create(['name' => 'view specific team details', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self team details', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self teams', 'guard_name' => 'api']);


        Permission::create(['name' => 'view reports', 'guard_name' => 'api']);
        Permission::create(['name' => 'view financial list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view efforts', 'guard_name' => 'api']);
        Permission::create(['name' => 'view project member list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view projects list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view team project member list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self project member list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view project time reports', 'guard_name' => 'api']);
        Permission::create(['name' => 'export project time reports', 'guard_name' => 'api']);
        Permission::create(['name' => 'view now working on tasks', 'guard_name' => 'api']);
        Permission::create(['name' => 'view user report full list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view users for filter reports', 'guard_name' => 'api']);
        Permission::create(['name' => 'view teams for filter reports', 'guard_name' => 'api']);
        Permission::create(['name' => 'view projects for filter reports', 'guard_name' => 'api']);

        Permission::create(['name' => 'view team user report list', 'guard_name' => 'api']);
        Permission::create(['name' => 'view team user report full list', 'guard_name' => 'api']);

        Permission::create(['name' => 'view salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'add salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self salary', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self salary', 'guard_name' => 'api']);

        Permission::create(['name' => 'view bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'add bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self bonus', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self bonus', 'guard_name' => 'api']);

        Permission::create(['name' => 'view documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'add documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self documents', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self documents', 'guard_name' => 'api']);

        Permission::create(['name' => 'view contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'add contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self contacts', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self contacts', 'guard_name' => 'api']);

        Permission::create(['name' => 'view job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'add job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self job information', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self job information', 'guard_name' => 'api']);

        Permission::create(['name' => 'view family information', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit family information', 'guard_name' => 'api']);

        Permission::create(['name' => 'add note', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit note', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete note', 'guard_name' => 'api']);

        Permission::create(['name' => 'view relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'add relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self relative', 'guard_name' => 'api']);
        Permission::create(['name' => 'view remuneration', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self remuneration', 'guard_name' => 'api']);

        Permission::create(['name' => 'edit job type', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self job type', 'guard_name' => 'api']);

        Permission::create(['name' => 'view vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'add vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self vacation', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self vacation', 'guard_name' => 'api']);

        Permission::create(['name' => 'view education', 'guard_name' => 'api']);
        Permission::create(['name' => 'add education', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit education', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete education', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self education', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self education', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self education', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self education', 'guard_name' => 'api']);

        Permission::create(['name' => 'view language', 'guard_name' => 'api']);
        Permission::create(['name' => 'add language', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit language', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete language', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self language', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self language', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self language', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self language', 'guard_name' => 'api']);

        Permission::create(['name' => 'view day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'add day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self day note', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self day note', 'guard_name' => 'api']);

        Permission::create(['name' => 'view more info', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self more info', 'guard_name' => 'api']);

        Permission::create(['name' => 'assign user to project', 'guard_name' => 'api']);

        Permission::create(['name' => 'upload avatar', 'guard_name' => 'api']);
        Permission::create(['name' => 'upload self avatar', 'guard_name' => 'api']);

        Permission::create(['name' => 'view self weekly activity', 'guard_name' => 'api']);

        // Full Calendar
        Permission::create(['name' => 'view others full calendar', 'guard_name' => 'api']);

        // google
        Permission::create(['name' => 'view others google calendar connection', 'guard_name' => 'api']);
        Permission::create(['name' => 'view others google auth url', 'guard_name' => 'api']);
        Permission::create(['name' => 'add others google calendar token', 'guard_name' => 'api']);
        Permission::create(['name' => 'remove others google calendar token', 'guard_name' => 'api']);
        Permission::create(['name' => 'add google calendar events', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit google calendar events', 'guard_name' => 'api']);

        // now only administrator can do this
        Permission::create(['name' => 'view roles permissions', 'guard_name' => 'api']);
        Permission::create(['name' => 'add roles permissions', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit roles permissions', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete roles permissions', 'guard_name' => 'api']);
        Permission::create(['name' => 'add permission to role', 'guard_name' => 'api']);
        Permission::create(['name' => 'remove permission from role', 'guard_name' => 'api']);

        // User Casual Information
        Permission::create(['name' => 'view user casual', 'guard_name' => 'api']);
        Permission::create(['name' => 'add user casual', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit user casual', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete user casual', 'guard_name' => 'api']);

        // User Other Spends Information
        Permission::create(['name' => 'view other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'add other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'add self other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit self other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete self other spends', 'guard_name' => 'api']);
        Permission::create(['name' => 'view self other spends', 'guard_name' => 'api']);
        // create roles and assign created permissions
        Role::create(['name' => Role::ADMINISTRATOR, 'priority' => 1])->givePermissionTo(Permission::all());

        Role::create(['name' => Role::HUMAN_RESOURCES_MANAGER, 'priority' => 2])
            ->givePermissionTo(Role::DEFAULT_HUMAN_RESOURCES_MANAGER_PERMISSIONS);

        Role::create(['name' => Role::MANAGER, 'priority' => 3])
            ->givePermissionTo(Role::DEFAULT_MANAGER_PERMISSIONS);

        Role::create(['name' => Role::STAFF, 'priority' => 4])
            ->givePermissionTo(Role::DEFAULT_STAFF_PERMISSIONS);
    }
}
