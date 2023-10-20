<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewFieldsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('surname')->after('name')->nullable()->default(null);
            $table->string('patronymic')->after('surname')->nullable()->default(null);
            $table->string('position')->after('status')->nullable()->default(null);
            $table->date('birthday')->after('position')->nullable()->default(null);
            $table->text('notes')->after('position')->nullable()->default(null);
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
            $table->dropColumn('notes');
            $table->dropColumn('birthday');
            $table->dropColumn('position');
            $table->dropColumn('patronymic');
            if (Schema::hasColumn('users', 'surname')) {
                $table->dropColumn('surname');
            }
        });
    }
}
