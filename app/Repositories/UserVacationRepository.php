<?php

namespace App\Repositories;

use App\Models\UserVacation;
use App\Repositories\Interfaces\UserVacationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class UserVacationRepository extends BaseRepository implements UserVacationRepositoryInterface
{
    /**
     * UserVacationRepository constructor.
     *
     * @param UserVacation $model
     */
    public function __construct(UserVacation $model)
    {
        parent::__construct($model);
    }

    /**
     * Get vacations info.
     * @param int $userId
     * @return Collection
     */
    public function getVacationsByUserId(int $userId): ?Collection
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * Get vacation info.
     * @param int $id
     * @param int $userId
     * @return Model
     */
    public function getVacationByIdAndUserId(int $id, int $userId): ?Model
    {
        return $this->model->where('id', $id)->where('user_id', $userId)->first();
    }

    /**
     * Update vacation info.
     * @param int $id
     * @param array $attributes
     * @return bool
     */
    public function updateVacation(int $id, array $attributes): ?bool
    {
        return $this->model->where('id', $id)->update($attributes);
    }
}
