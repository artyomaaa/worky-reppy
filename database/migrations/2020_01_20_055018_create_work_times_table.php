<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkTimesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_times', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('work_id');
            $table->dateTime('start_date_time');
            $table->dateTime('end_date_time')->nullable(); // the end_date_time = null means not finished work
            $table->unsignedInteger('duration')->default(0);
            $table->tinyInteger('submitted')->default(0);
            $table->timestamps();

            $table->foreign('work_id')
                ->references('id')->on('works')
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
        Schema::table('work_times', function (Blueprint $table) {
            $table->dropForeign('work_times_work_id_foreign');
        });
        Schema::dropIfExists('work_times');
    }
}
