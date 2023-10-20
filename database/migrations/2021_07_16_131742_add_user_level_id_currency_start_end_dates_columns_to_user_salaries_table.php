<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUserLevelIdCurrencyStartEndDatesColumnsToUserSalariesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_salaries', function (Blueprint $table) {
            $table->unsignedBigInteger('user_level_id')->after('user_id')->nullable()->default(null);
            $table->string('salary_currency')->after('salary')->default(config('app.default_currency'));
            $table->string('true_cost_currency')->after('true_cost')->default(config('app.default_currency'));

            if (Schema::hasColumn('user_salaries', 'date')) {
                \DB::statement("ALTER TABLE `user_salaries` CHANGE `date` `start_date` DATE NULL;");
            } else {
                $table->date('start_date')->nullable()->after('salary');
            }
            $table->date('end_date')->nullable()->after('start_date');

            $table->foreign('user_level_id')
                ->references('id')->on('user_levels')
                ->onUpdate('cascade')
                ->onDelete('set null');
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
            $table->dropForeign('user_salaries_user_level_id_foreign');

            $table->dropColumn('end_date');
            $table->dropColumn('start_date');
            $table->dropColumn('true_cost_currency');
            $table->dropColumn('salary_currency');
            $table->dropColumn('user_level_id');
        });
    }
}
