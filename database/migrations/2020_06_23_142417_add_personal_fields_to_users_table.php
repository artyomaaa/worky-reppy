<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPersonalFieldsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('gender')->after('birthday')->nullable()->default(null);
            $table->string('nationality')->after('gender')->nullable()->default(null);
            $table->string('birthplace')->after('nationality')->nullable()->default(null);
            $table->text('residence_address')->after('birthplace')->nullable()->default(null);
            $table->text('registration_address')->after('residence_address')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('gender');
            $table->dropColumn('nationality');
            $table->dropColumn('birthplace');
            $table->dropColumn('residence_address');
            $table->dropColumn('registration_address');

        });
    }
}
