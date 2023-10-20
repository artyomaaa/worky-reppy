<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkTimesTagsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_times_tags', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('work_time_id');
            $table->unsignedBigInteger('tag_id');
            $table->timestamps();

            $table->foreign('work_time_id')
                ->references('id')->on('work_times')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('tag_id')
                ->references('id')->on('tags')
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
        Schema::table('work_times_tags', function (Blueprint $table) {
            $table->dropForeign('work_times_tags_work_time_id_foreign');
            $table->dropForeign('work_times_tags_tag_id_foreign');
        });

        Schema::dropIfExists('work_times_tags');
    }
}
