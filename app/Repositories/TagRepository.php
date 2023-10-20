<?php

namespace App\Repositories;

use App\Models\Tag;
use App\Repositories\Interfaces\TagRepositoryInterface;
use Illuminate\Support\Collection;

class TagRepository extends BaseRepository implements TagRepositoryInterface
{

    /**
     * UserRepository constructor.
     *
     * @param Tag $model
     */
    public function __construct(Tag $model)
    {
        parent::__construct($model);
    }

    /**
     * @param array $ids
     * @return Collection
     */
    public function getTagsByIds(array $ids): Collection
    {
        return $this->model->whereIn('id', $ids)->orderBy('created_at', 'desc')->get();
    }

    /**
     * @param int $userId
     * @return Collection
     */
    public function getTagsByUserId(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * @param array $workIds
     * @return Collection
     */
    public function getTagsByWorkId(array $workIds): Collection
    {
        return \DB::table('works')
            ->select(
                'tags.id',
                'tags.name',
                'tags.color',
                'work_times.work_id',
                'work_times.id as work_time_id',
            )
            ->whereIn('works.id', $workIds)
            ->leftJoin('work_times', 'work_times.work_id', '=', 'works.id')
            ->leftJoin('work_times_tags', 'work_times_tags.work_time_id', '=', 'work_times.id')
            ->leftJoin('tags', 'tags.id', '=', 'work_times_tags.tag_id')
            ->get();
    }
}
