<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPriorityToRolesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('roles', 'priority')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->unsignedInteger("priority")->default(0)->after('guard_name');
            });

            \DB::table('roles')->where('name', \App\Role::ADMINISTRATOR)->update(['priority'=> 1]);
            \DB::table('roles')->where('name', \App\Role::HUMAN_RESOURCES_MANAGER)->update(['priority'=> 2]);
            \DB::table('roles')->where('name', \App\Role::MANAGER)->update(['priority'=> 3]);
            \DB::table('roles')->where('name', \App\Role::STAFF)->update(['priority'=> 4]);
        }

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('roles', function (Blueprint $table) {
            //
        });
    }
}
