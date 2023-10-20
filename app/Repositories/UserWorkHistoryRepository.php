<?php

namespace App\Repositories;

use App\Models\UserWorkHistory;
use App\Models\Work;
use App\Models\WorkTime;
use App\Repositories\Interfaces\UserWorkHistoryRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class UserWorkHistoryRepository extends BaseRepository implements UserWorkHistoryRepositoryInterface
{
    /**
     * UserWorkHistoryRepository constructor.
     *
     * @param UserWorkHistory $model
     */
    public function __construct(UserWorkHistory $model)
    {
        parent::__construct($model);
    }

    /**
     * Get user worked days count.
     * @param int $userId
     * @param $type
     * @param $startDate
     * @param $endDate
     * @return int
     */
    public function getWorkedDaysCountByType(int $userId, $type, $startDate, $endDate): int
    {
        return $this->model->where('user_id', $userId)
            ->where('type', $type)
            ->whereBetween('date', [$startDate, $endDate])
            ->count();
    }

    /**
     * Get work history info.
     * @param int $userId
     * @param $date
     * @return ?Model
     */
    public function getWorkHistoryDataByUserIdAndDate(int $userId, $date = null): ?Model
    {
        return $this->model->where('user_id', $userId)->whereDate('date', $date)->first();
    }

    /**
     * Get work history info.
     * @param int $userId
     * @param $startDate
     * @param $endDate
     * @return ?Collection
     */
    public function getWorkHistoryDataByUserIdAndBetweenDate(int $userId, $startDate, $endDate): ?Collection
    {
        return $this->model->where('user_id', $userId)->whereBetween('date', [$startDate, $endDate])->get();
    }

    /**
     * Getting weekly activity data.
     * @param int $userId
     * @return array
     */
    public function getUserWeeklyActivityData(int $userId): array
    {
        $weekStartDate = Carbon::now()->startOfWeek()->format('Y-m-d');
        $weekEndDate = Carbon::now()->endOfWeek()->format('Y-m-d');
        $lastWeekStartDate = Carbon::now()->subWeek()->startOfWeek()->format('Y-m-d');
        $lastWeekEndDate = Carbon::now()->subWeek()->endOfWeek()->format('Y-m-d');
        $startCurrentDay = Carbon::now()->startOfDay()->format('Y-m-d H-i-s');
        $endCurrentDay = Carbon::now()->endOfDay()->format('Y-m-d H-i-s');
        $startSevenDaysAgo = Carbon::now()->subDays(7)->startOfDay()->format('Y-m-d H-i-s');
        $endSevenDaysAgo = Carbon::now()->subDays(7)->endOfDay()->format('Y-m-d H-i-s');

        $thisWeek = Work::join('work_times', 'work_times.work_id', '=', 'works.id')
            ->where('works.user_id', $userId)
            ->select(WorkTime::raw("SUM(duration) as duration_this_week"))
            ->whereBetween('work_times.start_date_time', [$weekStartDate, $weekEndDate])
            ->first();
        $lastWeek = Work::join('work_times', 'work_times.work_id', '=', 'works.id')
            ->where('works.user_id', $userId)
            ->select(WorkTime::raw("SUM(duration) as duration_last_week"))
            ->whereBetween('work_times.start_date_time', [$lastWeekStartDate, $lastWeekEndDate])
            ->first();

        $workedProjectsCount = Work::distinct('project_id')
            ->join('work_times', 'work_times.work_id', '=', 'works.id')
            ->where('user_id', $userId)
            ->whereBetween('work_times.start_date_time', [$weekStartDate, $weekEndDate])
            ->count('project_id');

        $workedToday = Work::join('work_times', 'work_times.work_id', '=', 'works.id')
            ->where('works.user_id', $userId)
            ->select(WorkTime::raw("SUM(duration) as duration_today"))
            ->whereBetween('work_times.start_date_time', [$startCurrentDay, $endCurrentDay])
            ->first();

        $workedSevenDaysAgo = Work::join('work_times', 'work_times.work_id', '=', 'works.id')
            ->where('works.user_id', $userId)
            ->select(WorkTime::raw("SUM(duration) as duration_7_days_ago"))
            ->whereBetween('work_times.created_at', [$startSevenDaysAgo, $endSevenDaysAgo])
            ->first();

        return [
            'thisWeek' => !empty($thisWeek) ? (int) $thisWeek->duration_this_week : 0,
            'lastWeek' => !empty($lastWeek) ? (int) $lastWeek->duration_last_week : 0,
            'workedProjectsCount' => !empty($workedProjectsCount) ? (int) $workedProjectsCount : 0,
            'workedToday' => !empty($workedToday) ? (int) $workedToday->duration_today : 0,
            'workedSevenDaysAgo' => !empty($workedSevenDaysAgo) ? (int) $workedSevenDaysAgo->duration_7_days_ago : 0,
        ];
    }
}
