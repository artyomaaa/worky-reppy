<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface UserWorkHistoryRepositoryInterface
{
    /**
     * Get user worked days count.
     * @param int $userId
     * @param $type
     * @param $startDate
     * @param $endDate
     * @return int
     */
    public function getWorkedDaysCountByType(int $userId, $type, $startDate, $endDate): int;

    /**
     * Get work history info.
     * @param int $userId
     * @param $date
     * @return ?Model
     */
    public function getWorkHistoryDataByUserIdAndDate(int $userId, $date = null): ?Model;

    /**
     * Get work history info.
     * @param int $userId
     * @param $startDate
     * @param $endDate
     * @return ?Collection
     */
    public function getWorkHistoryDataByUserIdAndBetweenDate(int $userId, $startDate, $endDate): ?Collection;
}
