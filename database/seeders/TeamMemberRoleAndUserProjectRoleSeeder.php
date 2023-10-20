<?php
namespace Database\Seeders;

use App\Models\TeamMemberRole;
use App\Models\UserProjectRole;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TeamMemberRoleAndUserProjectRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nowTime = Carbon::now(env('TIMEZONE', 'UTC'));

        // Team Member Roles
        $defaultTeamMemberRoles = [
            ['name' => 'Developer', 'created_at' => $nowTime, 'updated_at' => $nowTime],
            ['name' => 'Team Lead', 'created_at' => $nowTime, 'updated_at' => $nowTime],
            ['name' => 'Project Manager', 'created_at' => $nowTime, 'updated_at' => $nowTime],
        ];
        TeamMemberRole::insert($defaultTeamMemberRoles);
        $this->command->info('Created default team member roles...');

        // User Project Roles
        $defaultUserProjectRoles = [
            ['name' => 'Staff', 'created_at' => $nowTime, 'updated_at' => $nowTime],
            ['name' => 'Supervisor', 'created_at' => $nowTime, 'updated_at' => $nowTime],
        ];
        UserProjectRole::insert($defaultUserProjectRoles);
        $this->command->info('Created default user project roles...');
    }
}
