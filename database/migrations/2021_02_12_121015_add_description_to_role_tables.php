<?php

use Illuminate\Database\Migrations\Migration;

class AddDescriptionToRoleTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement(\DB::raw("ALTER TABLE `roles` ADD `description` TEXT NULL DEFAULT NULL AFTER `name`"));
        \DB::statement(\DB::raw("ALTER TABLE `team_member_roles` ADD `description` TEXT NULL DEFAULT NULL AFTER `name`"));
        \DB::statement(\DB::raw("ALTER TABLE `user_project_roles` ADD `description` TEXT NULL DEFAULT NULL AFTER `name`"));

        \DB::statement(\DB::raw("UPDATE permissions SET guard_name = 'api' where 1=1;"));
        \DB::statement(\DB::raw("UPDATE roles SET guard_name = 'api' where 1=1;"));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        \DB::statement(\DB::raw("ALTER TABLE `roles` DROP `description`"));
        \DB::statement(\DB::raw("ALTER TABLE `team_member_roles` DROP `description`"));
        \DB::statement(\DB::raw("ALTER TABLE `user_project_roles` DROP `description`"));

        \DB::statement(\DB::raw("UPDATE permissions SET guard_name = 'web' where 1=1;"));
        \DB::statement(\DB::raw("UPDATE roles SET guard_name = 'web' where 1=1;"));

    }
}
