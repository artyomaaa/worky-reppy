<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewOfStudyColumnToUserEducationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_education', function (Blueprint $table) {
            $table->string('of_study')->after('degree')->nullable();
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
            if (Schema::hasColumn('user_education', 'of_study')) {
                $table->dropColumn('of_study');
            }
        });
    }
}
