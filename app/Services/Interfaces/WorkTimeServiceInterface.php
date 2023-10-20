<?php

namespace App\Services\Interfaces;

interface WorkTimeServiceInterface
{
    /**
     * @param array $ids
     * @param int $commentsLimit
     * @return mixed
     */
    public function getIdsWithComments(array $ids, int $commentsLimit = 1);

    /**
     * @param int $userId
     * @return mixed
     */
    public function stopStartedWork(int $userId);

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public function stopWorkByWorkTimeId(int $workTimeId);
}
