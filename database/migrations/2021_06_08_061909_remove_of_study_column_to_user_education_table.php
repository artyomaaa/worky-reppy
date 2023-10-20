<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveOfStudyColumnToUserEducationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_education', function (Blueprint $table) {
            if (Schema::hasColumn('user_education', 'of_study')) {
                $table->dropColumn('of_study');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_education', function (Blueprint $table) {
            //
        });
    }
}
