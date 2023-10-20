<?php

namespace App\Services;

use App\Repositories\WorkTimeTagRepository;
use App\Services\Interfaces\WorkTimeTagServiceInterface;

class WorkTimeTagService extends BaseService implements WorkTimeTagServiceInterface
{
    /**
     * WorkTimeTagService constructor.
     *
     * @param WorkTimeTagRepository $workTimeTagRepository
     */
    public function __construct(WorkTimeTagRepository $workTimeTagRepository)
    {
        parent::__construct($workTimeTagRepository);
    }

    /**
     * @param array $workTimesIds
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getTagsByWorkTimeIdsAndStartEndDateTime(array $workTimesIds, string $startDateTime, string $endDateTime)
    {
        return $this->modelRepository->getTagsByWorkTimeIdsAndStartEndDateTime($workTimesIds, $startDateTime, $endDateTime);
    }

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public function getTagIdsByWorkTimeId(int $workTimeId)
    {
        return $this->modelRepository->getTagIdsByWorkTimeId($workTimeId);
    }

    /**
     * @param int $workTimeId
     * @param array $tagIds
     * @return mixed
     */
    public function addWorkTimeTags(int $workTimeId, array $tagIds)
    {
        return $this->modelRepository->addWorkTimeTags($workTimeId, $tagIds);
    }
}
