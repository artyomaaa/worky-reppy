<?php

namespace App\Services;

use App\Repositories\WorkTimeRepository;
use App\Services\Interfaces\WorkTimeServiceInterface;

class WorkTimeService extends BaseService implements WorkTimeServiceInterface
{
    /**
     * WorkTimeService constructor.
     *
     * @param WorkTimeRepository $workTimeRepository
     */
    public function __construct(WorkTimeRepository $workTimeRepository)
    {
        parent::__construct($workTimeRepository);
    }

    /**
     * @param array $ids
     * @param int $commentsLimit
     * @return mixed
     */
    public function getIdsWithComments(array $ids, int $commentsLimit = 1)
    {
        return $this->modelRepository->getIdsWithComments($ids, $commentsLimit);
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function stopStartedWork(int $userId)
    {
        return $this->modelRepository->stopStartedWork($userId);
    }

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public function stopWorkByWorkTimeId(int $workTimeId)
    {
        return $this->modelRepository->stopWorkByWorkTimeId($workTimeId);
    }
}
