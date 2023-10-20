<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoleIdToUserProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_projects', function (Blueprint $table) {
            $table->unsignedBigInteger('user_project_role_id')->nullable()->after('project_id');
            $table->foreign('user_project_role_id', 'upr_id_foreign')
                ->references('id')
                ->on('user_project_roles')
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
        Schema::table('user_projects', function (Blueprint $table) {
            $table->dropForeign('upr_id_foreign');
            $table->dropColumn('user_project_role_id');
        });
    }
}
