<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWorkContractStartDateColumnToUserJobInformationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_job_information', function (Blueprint $table) {
            if (Schema::hasColumn('user_job_information', 'started_date')) {
                \DB::statement("ALTER TABLE `user_job_information` CHANGE `started_date` `work_contract_start_date` DATE NULL;");
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
        Schema::table('user_job_information', function (Blueprint $table) {
            //
        });
    }
}
