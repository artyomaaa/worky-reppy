<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPriceCurrencyColumnToProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('price_currency')->nullable()->default('USD')->after('type');
            if (Schema::hasColumn('projects', 'rate')) {
                \DB::statement("ALTER TABLE `projects` CHANGE `rate` `price` DOUBLE NULL;");
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
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('price_currency');
        });
    }
}
