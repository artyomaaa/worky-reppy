<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFullNameColumnToUserRelativesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_relatives', function (Blueprint $table) {
            $table->string('full_name')->after('type');
        });
        Schema::table('user_relatives', function (Blueprint $table) {
            if (Schema::hasColumn('user_relatives', 'name') || Schema::hasColumn('user_relatives', 'surname')) {
                \App\Models\UserRelative::get()->each(function($user_relative, $key) {
                    $user_relative->update([
                        'full_name' => $user_relative->name . ' ' . $user_relative->surname
                    ]);
                });

                if (Schema::hasColumn('user_relatives', 'name')) {
                    $table->dropColumn('name');
                }
                if (Schema::hasColumn('user_relatives', 'surname')) {
                    $table->dropColumn('surname');
                }

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
        Schema::table('user_relatives', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });
    }
}
