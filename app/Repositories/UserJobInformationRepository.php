<?php

namespace App\Repositories;

use App\Models\UserJobInformation;
use App\Repositories\Interfaces\UserJobInformationRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

class UserJobInformationRepository extends BaseRepository implements UserJobInformationRepositoryInterface
{
    /**
     * UserJobInformationRepository constructor.
     *
     * @param UserJobInformation $model
     */
    public function __construct(UserJobInformation $model)
    {
        parent::__construct($model);
    }

    /**
     * @param int $userId
     * @param int $id
     * @return Model
     */
    public function getItemByUserIdAndId(int $userId, int $id): Model
    {
        return $this->model->where('user_id', $userId)->where('id', $id)->first();
    }
}
