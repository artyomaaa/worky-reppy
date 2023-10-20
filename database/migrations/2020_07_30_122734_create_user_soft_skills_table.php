<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserSoftSkillsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_soft_skills', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('soft_skill_id');
            $table->date('date');
            $table->timestamps();

            $table->foreign('soft_skill_id')
                ->references('id')->on('soft_skills')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_soft_skills', function (Blueprint $table) {
            $keyExists = \DB::select(
                \DB::raw(
                    'SHOW KEYS
                    FROM user_soft_skills
                    WHERE Key_name=\'user_soft_skill_soft_skill_id_foreign\''
                )
            );
            if ($keyExists) {
                $table->dropForeign('user_soft_skill_soft_skill_id_foreign');
            }

            $keyExists = \DB::select(
                \DB::raw(
                    'SHOW KEYS
                    FROM user_soft_skills
                    WHERE Key_name=\'user_soft_skill_user_id_foreign\''
                )
            );
            if ($keyExists) {
                $table->dropForeign('user_soft_skill_user_id_foreign');
            }
        });
        Schema::dropIfExists('user_soft_skills');
    }
}
