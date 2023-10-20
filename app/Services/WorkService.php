<?php

namespace App\Services;

use App\Repositories\WorkRepository;
use App\Services\Interfaces\WorkServiceInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class WorkService extends BaseService implements WorkServiceInterface
{
    /**
     * WorkService constructor.
     *
     * @param WorkRepository $workRepository
     */
    public function __construct(WorkRepository $workRepository)
    {
        parent::__construct($workRepository);
    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getTodayWorksQuery(int $userId, string $startDateTime, string $endDateTime)
    {
        return $this->modelRepository->getTodayWorksQuery($userId, $startDateTime, $endDateTime);
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getWorkTimeIdsByUserId(int $userId)
    {
        return $this->modelRepository->getWorkTimeIdsByUserId($userId);
    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function stoppedTotalDuration(int $userId, string $startDateTime, string $endDateTime)
    {
        return $this->modelRepository->stoppedTotalDuration($userId, $startDateTime, $endDateTime);
    }

    /**
     * @param string $name
     * @param int $userId
     * @param int|null $projectId
     * @return mixed
     */
    public function getWorkByName(string $name, int $userId, int $projectId = null)
    {
        return $this->modelRepository->getWorkByName($name, $userId, $projectId);
    }

    /**
     * @param int $id
     * @return Builder|Model|object|null
     */
    public function getWorkWithTimesById(int $id)
    {
        return $this->modelRepository->getWorkWithTimesById($id);
    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return Collection
     */
    public function getWorksData(int $userId, string $startDateTime, string $endDateTime): Collection
    {
        return $this->modelRepository->getWorksData($userId, $startDateTime, $endDateTime);
    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return array
     */
    public function getTodayBusyTimes(int $userId, string $startDateTime, string $endDateTime): array
    {
        $todayBusyTimes = [];
        $todayBusyTimesFullData = $this->getTodayWorksQuery($userId, $startDateTime, $endDateTime)->get(['id', 'work_time_id', 'start_date_time', 'end_date_time']);
        if (count($todayBusyTimesFullData) > 0) {
            foreach ($todayBusyTimesFullData as $workItem) {
                $todayBusyTime = collect($workItem)->only(['id', 'work_time_id', 'start_date_time', 'end_date_time'])->all();
                array_push($todayBusyTimes, $todayBusyTime);
            }
        }
        return $todayBusyTimes;
    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getLatestTask(int $userId, string $startDateTime, string $endDateTime)
    {
        return $this->getTodayWorksQuery($userId, $startDateTime, $endDateTime)->first();
    }
}
