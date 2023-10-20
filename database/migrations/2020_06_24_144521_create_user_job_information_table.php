<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserJobInformationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_job_information', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->date('interview')->nullable();
            $table->date('work_contract')->nullable();
            $table->date('started_date')->nullable();
            $table->date('experimental_period')->nullable();
            $table->string('position')->nullable();
            $table->string('position_description')->nullable();
            $table->timestamps();
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
        Schema::table('user_job_information', function (Blueprint $table) {
            $table->dropForeign('user_job_information_user_id_foreign');
        });
        Schema::dropIfExists('user_job_information');
    }
}
