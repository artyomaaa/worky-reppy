<?php

use Illuminate\Database\Migrations\Migration;

class UpdateModelTypesRolesPermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // This need for laravel 8.x, the models namespace/directory changed
        \DB::table(config('permission.table_names.model_has_permissions'))->where('model_type', 'App\User')->update(['model_type' => 'App\Models\User']);
        \DB::table(config('permission.table_names.model_has_roles'))->where('model_type', 'App\User')->update(['model_type' => 'App\Models\User']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // This need for laravel 7.x, the models namespace/directory changed
        \DB::table(config('permission.table_names.model_has_permissions'))->where('model_type', 'App\Models\User')->update(['model_type' => 'App\User']);
        \DB::table(config('permission.table_names.model_has_roles'))->where('model_type', 'App\Models\User')->update(['model_type' => 'App\User']);
    }
}
