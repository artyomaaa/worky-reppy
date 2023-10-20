<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUniqueIdToUserNotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->string('uuid')->after('id')->nullable();
            $table->unsignedBigInteger('owner_user_id')->after('user_id');
            $table->json('shared_users')->after('author_of_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->dropColumn('uuid');
            $table->dropColumn('owner_user_id');
            $table->dropColumn('shared_users');
        });
    }
}
