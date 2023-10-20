<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewColumnsForTableUserRelatives extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_relatives', function($table) {
            $table->string('surname')->after('name');
            $table->string('email')->after('surname')->nullable()->default(null)->unique();
            $table->string('gender')->after('email')->nullable()->default(null);
            $table->date('birthday')->after('gender')->nullable()->default(null);
            $table->string('phone_number')->after('birthday')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_relatives', function($table) {
            if (Schema::hasColumn('user_relatives', 'surname')) {
                $table->dropColumn('surname');
            }
            $table->dropColumn('email');
            $table->dropColumn('gender');
            $table->dropColumn('birthday');
            $table->dropColumn('phone_number');
        });
    }
}
