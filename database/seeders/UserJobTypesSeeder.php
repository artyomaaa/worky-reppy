<?php

namespace Database\Seeders;

use App\Models\UserJobType;
use Illuminate\Database\Seeder;

class UserJobTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nowTime = now();
        $jobTypes = [
            [
                'name' => 'Full-time',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Part-time',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Casual employees',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Fixed term and contract',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Apprentices and trainees',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Commission and place rate',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ]
        ];
        UserJobType::insert($jobTypes);
    }
}
