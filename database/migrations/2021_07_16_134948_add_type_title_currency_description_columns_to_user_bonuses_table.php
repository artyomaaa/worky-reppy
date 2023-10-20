<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTypeTitleCurrencyDescriptionColumnsToUserBonusesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_bonuses', function (Blueprint $table) {
            $table->string('title')->after('user_id')->nullable()->default(null);
            $table->text('description')->after('title')->nullable()->default(null);
            $table->enum('type', ['bonus', 'other_spend'])->after('description')->default('bonus');
            $table->string('currency')->after('bonus')->default(config('app.default_currency'));

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_bonuses', function (Blueprint $table) {
            $table->dropColumn('currency');
            $table->dropColumn('type');
            $table->dropColumn('description');
            $table->dropColumn('title');
        });
    }
}
