<?php

namespace App\Services;

use App\Repositories\UserWorkHistoryRepository;
use App\Services\Interfaces\UserWorkHistoryServiceInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class UserWorkHistoryService extends BaseService implements UserWorkHistoryServiceInterface
{
    /**
     * UserWorkHistoryService constructor.
     *
     * @param UserWorkHistoryRepository $userWorkHistoryRepository
     */
    public function __construct(UserWorkHistoryRepository $userWorkHistoryRepository)
    {
        parent::__construct($userWorkHistoryRepository);
    }

    /**
     * Get worked days analysis.
     * @param int $userId
     * @param $date
     * @return array
     */
    public function getWorkedDaysAnalysis(int $userId, $date = null): array
    {
        if (!$date) $date = Carbon::now();
        $startDate = Carbon::parse($date)->firstOfMonth();
        $endDate = Carbon::parse($date)->lastOfMonth();
        $businessDays = $this->getBusinessDaysCount($startDate, $endDate);
        $additionalWorkingDays = $this->modelRepository->getWorkedDaysCountByType($userId, 'additional', $startDate, $endDate);
        $notWorkingDays = $this->modelRepository->getWorkedDaysCountByType($userId, 'not_working', $startDate, $endDate);
        $workingDays = $businessDays + $additionalWorkingDays - $notWorkingDays;

        return [
            'workingDays' => $workingDays,
            'notWorkingDays' => $notWorkingDays,
            'additionalWorkingDays' => $additionalWorkingDays
        ];
    }

    /**
     * Get work history info.
     * @param int $userId
     * @param $date
     * @return ?Model
     */
    public function getWorkHistoryInfo(int $userId, $date = null): ?Model
    {
        $date = $date ? $date : Carbon::now();
        return $this->modelRepository->getWorkHistoryDataByUserIdAndDate($userId, $date);
    }

    /**
     * Get work history info for selected month.
     * @param int $userId
     * @param $date
     * @return ?Collection
     */
    public function getWorkHistoryInfoForSelectedMonth(int $userId, $date = null): ?Collection
    {
        if (!$date) $date = Carbon::now();
        $startDate = Carbon::parse($date)->firstOfMonth();
        $endDate = Carbon::parse($date)->lastOfMonth();

        return $this->modelRepository->getWorkHistoryDataByUserIdAndBetweenDate($userId, $startDate, $endDate);
    }

    /**
     * Get worked days count.
     *
     * @param $startDate
     * @param $endDate
     * @return int
     */
    private function getBusinessDaysCount($startDate, $endDate): int
    {
        return $startDate->diffInDaysFiltered(function(Carbon $date) {
            return $date->isWeekday();
        }, $endDate->addSecond());
    }

    /**
     * Create work day note.
     *
     * @param $request
     * @return Model
     */
    public function createWorkDayNote($request): ?Model
    {
        $attributes = [
            'user_id' => $request->user_id,
            'title' => $request->title,
            'type' => $request->type,
            'description' => $request->description,
            'date' => $request->date,
        ];

        return $this->modelRepository->create($attributes);
    }

    /**
     * Getting weekly activity data.
     * @param int $userId
     * @return array
     */

    public function getWeeklyActivityData(int $userId): array
    {
        return $this->modelRepository->getUserWeeklyActivityData($userId);

    }
}
