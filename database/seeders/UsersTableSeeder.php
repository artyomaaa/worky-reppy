<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $admin = new User();
        $admin->fill([
            "name" => 'admin',
            "email" => env('ADMIN_EMAIL'),
            "password" => bcrypt(env('ADMIN_DEFAULT_PASSWORD')),
        ]);
        if ($admin->save()) {
            $admin->assignRole(Role::ADMINISTRATOR);
        }

        if (env('APP_ENV') !== 'production'){
            User::factory()->count(3)->create()->each(function ($user) {
                $user->assignRole(Role::ADMINISTRATOR);
            });

            User::factory()->count(5)->create()->each(function ($user) {
                $user->assignRole(Role::HUMAN_RESOURCES_MANAGER);
            });

            User::factory()->count(5)->create()->each(function ($user) {
                $user->assignRole(Role::MANAGER);
            });

            User::factory()->count(50)->create()->each(function ($user) {
                $user->assignRole(Role::STAFF);
            });
        }
    }
}
