<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Model;

interface UserJobInformationServiceInterface
{
    /**
     * @param int $userId
     * @param int $id
     * @return Model
     */
    public function getItemByUserIdAndId(int $userId, int $id): Model;
}
