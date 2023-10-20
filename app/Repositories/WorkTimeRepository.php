<?php

namespace App\Repositories;

use App\Models\WorkTime;
use App\Repositories\Interfaces\WorkTimeRepositoryInterface;

class WorkTimeRepository extends BaseRepository implements WorkTimeRepositoryInterface
{

    /**
     * WorkTimeRepository constructor.
     *
     * @param WorkTime $model
     */
    public function __construct(WorkTime $model)
    {
        parent::__construct($model);
    }

    /**
     * @param array $ids
     * @param int $commentsLimit
     * @return mixed
     */
    public function getIdsWithComments(array $ids, int $commentsLimit = 1)
    {
        return $this->getModel()->whereIn('id', $ids)->with(['comments' => function($q) use ($commentsLimit) {
            $q->whereNull('comments.parent_id')
                ->orderBy('comments.created_at', 'desc')
                ->limit($commentsLimit);
            $q->join('users', 'users.id', '=', 'comments.user_id');
            $q->select(
                'comments.*',
                'users.name as username',
                'users.avatar as user_avatar'
            );
        }])->get('id', 'comments.*');
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function stopStartedWork(int $userId)
    {
        return $this->model::stopStartedWork($userId);

    }

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public function stopWorkByWorkTimeId(int $workTimeId)
    {
        return $this->model::stopWorkByWorkTimeId($workTimeId);

    }
}
