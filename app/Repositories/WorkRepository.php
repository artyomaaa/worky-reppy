<?php

namespace App\Repositories;

use App\Models\Work;
use App\Repositories\Interfaces\WorkRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class WorkRepository extends BaseRepository implements WorkRepositoryInterface
{
    /**
     * WorkRepository constructor.
     *
     * @param Work $model
     */
    public function __construct(Work $model)
    {
        parent::__construct($model);
    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getTodayWorksQuery(int $userId, string $startDateTime, string $endDateTime)
    {
        return $this->getModel()->getTodayWorksQuery($userId, $startDateTime, $endDateTime);
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getWorkTimeIdsByUserId(int $userId)
    {
        return $this->getModel()
            ->leftJoin('work_times', 'works.id', '=', 'work_times.work_id')
            ->where('works.user_id', $userId)
            ->pluck('work_times.id')
            ->toArray();

    }

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function stoppedTotalDuration(int $userId, string $startDateTime, string $endDateTime)
    {
        return $this->getModel()->leftJoin('work_times', 'works.id', '=', 'work_times.work_id')
            ->select(
                'works.user_id',
                'work_times.duration'
            )
            ->where('works.user_id', $userId)
            ->whereBetween('work_times.start_date_time', [$startDateTime, $endDateTime])
            ->sum('duration');
    }

    /**
     * @param string $name
     * @param int $userId
     * @param int|null $projectId
     * @return mixed
     */
    public function getWorkByName(string $name, int $userId, int $projectId = null)
    {
        return $this->model::getWorkByName($name, $userId, $projectId);
    }

    /**
     * @param int $id
     * @return Builder|Model|object|null
     */
    public function getWorkWithTimesById(int $id)
    {
        return $this->model->with('workTimes')->where('id', $id)->first();
    }


    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return Collection
     */
    public function getWorksData(int $userId, string $startDateTime, string $endDateTime): Collection
    {
        return \DB::table('reports_view')
            ->where('work_user_id', '=', $userId)
            ->whereBetween('reports_view.start_date_time', [$startDateTime, $endDateTime])
            ->orderBy('reports_view.start_date_time', 'desc')
            ->get();
    }
}
