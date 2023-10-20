<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeAndAddColumnsToUserJobInformationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_job_information', function (Blueprint $table) {
            $table->text('position_description')->nullable()->change();
            $table->renameColumn('experimental_period', 'experimental_period_end_date');
            $table->date('experimental_period_start_date')->nullable()->after('started_date');
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
            $table->dropColumn('experimental_period_end_date');
            $table->renameColumn('experimental_period_start_date', 'experimental_period');
            $table->string('position_description')->nullable()->change();
        });
    }
}
