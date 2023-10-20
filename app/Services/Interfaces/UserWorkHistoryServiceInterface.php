<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface UserWorkHistoryServiceInterface
{
    /**
     * Get worked days analysis.
     * @param int $userId
     * @param $date
     * @return array
     */
    public function getWorkedDaysAnalysis(int $userId, $date = null): array;

    /**
     * Get work history info.
     * @param int $userId
     * @param $date
     * @return Model
     */
    public function getWorkHistoryInfo(int $userId, $date = null): ?Model;

    /**
     * Get work history info for selected month.
     * @param int $userId
     * @param $date
     * @return ?Collection
     */
    public function getWorkHistoryInfoForSelectedMonth(int $userId, $date = null): ?Collection;

    /**
     * Create work day note.
     *
     * @param $request
     * @return Model
     */
    public function createWorkDayNote($request): ?Model;

    /**
     * Getting weekly activity data.
     * @param int $userId
     * @return array
     */
    public function getWeeklyActivityData(int $userId): array;
}
