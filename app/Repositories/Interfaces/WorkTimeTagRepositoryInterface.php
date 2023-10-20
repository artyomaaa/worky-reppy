<?php
namespace App\Repositories\Interfaces;

interface WorkTimeTagRepositoryInterface
{
    /**
     * @param array $workTimesIds
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getTagsByWorkTimeIdsAndStartEndDateTime(array $workTimesIds, string $startDateTime, string $endDateTime);

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public function getTagIdsByWorkTimeId(int $workTimeId);

    /**
     * @param int $workTimeId
     * @param array $tagIds
     * @return mixed
     */
    public function addWorkTimeTags(int $workTimeId, array $tagIds);
}
