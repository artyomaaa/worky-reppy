<?php

namespace Database\Seeders;

use App\Models\UserLevel;
use Illuminate\Database\Seeder;

class UserLevelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $nowTime = now();
        $levels = [
            [
                'name' => 'Junior 1',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Junior 2',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Junior 3',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Middle 1',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Middle 2',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Middle 3',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Senior 1',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Senior 2',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
            [
                'name' => 'Senior 3',
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ],
        ];
        UserLevel::insert($levels);
    }
}
