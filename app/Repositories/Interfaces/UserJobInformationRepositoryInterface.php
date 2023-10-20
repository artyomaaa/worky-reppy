<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;

interface UserJobInformationRepositoryInterface
{
    /**
     * @param int $userId
     * @param int $id
     * @return Model
     */
    public function getItemByUserIdAndId(int $userId, int $id): Model;
}
