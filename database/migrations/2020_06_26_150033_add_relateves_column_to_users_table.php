<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelatevesColumnToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::table('users', function (Blueprint $table) {
            $table->string('father')->nullable();
            $table->string('mother')->nullable();
            $table->integer('family_status')->nullable();
            $table->string('spouse')->nullable();
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
            $table->dropColumn('father');
            $table->dropColumn('mother');
            $table->dropColumn('family_status');
            $table->dropColumn('spouse');

        });
    }
}

