<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportsView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement("
            CREATE OR REPLACE VIEW
                reports_view AS
                    SELECT
                        w.id as work_id,
                        w.name as work_name,
                        wt.id as work_time_id,
                        wt.start_date_time,
                        wt.end_date_time,
                        wt.submitted,
                        DATE(wt.start_date_time) as start_date,
                        DATE(wt.end_date_time) as end_date,
                        wt.duration,

                        uw.id as work_user_id,
                        uw.name as work_user_name,
                        uw.status as work_user_status,
                        uw.avatar as work_user_avatar,

                        p.id as project_id,
                        p.name as project_name,
                        p.description as project_description,
                        p.color as project_color,
                        p.status as project_status,

                        up.id as project_user_id,
                        up.name as project_user_name,
                        up.status as project_user_status

                    FROM works w

                             JOIN work_times wt on w.id = wt.work_id
                             LEFT JOIN users uw on w.user_id = uw.id
                             LEFT JOIN projects p on p.id = w.project_id
                             LEFT JOIN users up on p.user_id = up.id
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
//        \DB::statement("DROP VIEW reports_view");
    }
}
