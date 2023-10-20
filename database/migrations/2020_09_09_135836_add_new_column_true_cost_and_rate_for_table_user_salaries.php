<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewColumnTrueCostAndRateForTableUserSalaries extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_salaries', function (Blueprint $table) {
            $table->string('true_cost')->default(null)->after('status');
            $table->string('rate')->default(null)->after('true_cost');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_salaries', function (Blueprint $table) {
            $table->dropColumn('true_cost');
            $table->dropColumn('rate');
        });
    }
}
