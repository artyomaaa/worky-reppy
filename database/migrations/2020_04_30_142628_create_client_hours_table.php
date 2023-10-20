<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientHoursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('client_hours', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('project_id');
            $table->date('date');
            $table->unsignedBigInteger('time');
            $table->timestamps();

            $table->foreign('project_id')
                ->references('id')->on('projects')
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
        Schema::table('client_hours', function (Blueprint $table) {
            $table->dropForeign('client_hours_project_id_foreign');
            $table->dropForeign('client_hours_user_id_foreign');
        });
        Schema::dropIfExists('client_hours');
    }

}
