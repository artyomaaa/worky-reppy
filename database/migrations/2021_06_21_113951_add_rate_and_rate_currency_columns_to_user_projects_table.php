<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRateAndRateCurrencyColumnsToUserProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_projects', function (Blueprint $table) {
            $table->string('rate_currency')->nullable()->default('USD')->after('user_project_role_id');
            $table->double('rate')->nullable()->after('user_project_role_id');
            \DB::statement("ALTER TABLE `user_projects` CHANGE `status` `status` TINYINT(3) UNSIGNED DEFAULT 1 NOT NULL;");
            \DB::statement("UPDATE user_projects SET status = 0 WHERE status=2;");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_projects', function (Blueprint $table) {
            $table->dropColumn('rate');
            $table->dropColumn('rate_currency');
        });
    }
}
