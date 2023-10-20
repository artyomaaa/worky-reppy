<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCompanyNameLocationWorkContractEndDateColumnsToUserJobInformationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_job_information', function (Blueprint $table) {
            $table->date('work_contract_end_date')->nullable()->after('started_date');
            $table->string('company_name')->nullable()->after('user_id');
            $table->string('location')->nullable()->after('company_name');

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
            $table->dropColumn('work_contract_end_date');
            $table->dropColumn('company_name');
            $table->dropColumn('location');
        });
    }
}
