<?php

namespace App\Repositories;

use App\Models\ClientHour;
use App\Repositories\Interfaces\ClientHourRepositoryInterface;

class ClientHourRepository extends BaseRepository implements ClientHourRepositoryInterface
{

    /**
     * UserRepository constructor.
     *
     * @param ClientHour $model
     */
    public function __construct(ClientHour $model)
    {
        parent::__construct($model);
    }

    /**
     * @param string $date
     * @param int $userId
     * @return mixed
     */
    public function removeByDateAndUserId(string $date, int $userId)
    {
        return $this->model->where([
            ['date', '=', $date],
            ['user_id', '=', $userId],
        ])->delete();
    }
}
