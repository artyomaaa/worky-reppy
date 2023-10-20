<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTeamMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('team_id');
            $table->unsignedBigInteger('user_id'); // the user: worker id
            $table->unsignedTinyInteger('status')->default(0); // 0 = Developer, 1 = ProductManager, 2 = TeamLead
            $table->timestamps();

            $table->foreign('team_id')
                ->references('id')->on('teams')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
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
            $table->dropForeign('team_members_team_id_foreign');
            $table->dropForeign('team_members_user_id_foreign');
        });
        Schema::dropIfExists('team_members');
    }
}
