<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoleIdToTeamMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->unsignedBigInteger('team_member_role_id')->nullable()->after('user_id');
            $table->foreign('team_member_role_id', 'tmr_id_foreign')
                ->references('id')
                ->on('team_member_roles')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->dropForeign('tmr_id_foreign');
            $table->dropColumn('team_member_role_id');
        });
    }
}
