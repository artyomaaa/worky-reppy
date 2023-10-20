<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReminderAndReminderDateTimeColumnsToUserNotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->unsignedTinyInteger('reminder')->default(0);
            $table->timestamp('reminder_date_time')->nullable();
            $table->string('google_event_id')->nullable();
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
            $table->dropColumn('reminder');
            $table->dropColumn('reminder_date_time');
            $table->dropColumn('google_event_id');
        });
    }
}
