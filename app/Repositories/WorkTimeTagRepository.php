<?php

namespace App\Repositories;

use App\Models\WorkTimeTag;
use App\Repositories\Interfaces\WorkTimeTagRepositoryInterface;

class WorkTimeTagRepository extends BaseRepository implements WorkTimeTagRepositoryInterface
{
    /**
     * WorkTimeTagRepository constructor.
     *
     * @param WorkTimeTag $model
     */
    public function __construct(WorkTimeTag $model)
    {
        parent::__construct($model);
    }

    /**
     * @param array $workTimesIds
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getTagsByWorkTimeIdsAndStartEndDateTime(array $workTimesIds, string $startDateTime, string $endDateTime)
    {
        return $this->getModel()
            ->join('work_times', 'work_times.id', '=', 'work_times_tags.work_time_id')
            ->join('tags', 'tags.id', '=', 'work_times_tags.tag_id')
            ->whereIn('work_time_id', $workTimesIds)
            ->where('work_times.start_date_time', '>=', $startDateTime)
            ->where(function($q) use ($endDateTime){
                $q->whereNull('work_times.end_date_time');
                $q->orWhere('work_times.end_date_time', '<=', $endDateTime);
            })
            ->select(
                'tags.*',
                'work_times_tags.*'
            )->get()->toArray();
    }

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public function getTagIdsByWorkTimeId(int $workTimeId)
    {
        return $this->getModel()->where('work_time_id', $workTimeId)->pluck('tag_id')->toArray();
    }

    /**
     * @param int $workTimeId
     * @param array $tagIds
     * @return mixed
     */
    public function addWorkTimeTags(int $workTimeId, array $tagIds)
    {
        return $this->model::addWorkTimeTags($workTimeId, $tagIds);
    }
}
