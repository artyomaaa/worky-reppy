<?php

namespace App\Services;

use App\Repositories\UserJobInformationRepository;
use App\Services\Interfaces\UserJobInformationServiceInterface;
use Illuminate\Database\Eloquent\Model;

class UserJobInformationService extends BaseService implements UserJobInformationServiceInterface
{
    /**
     * UserJobInformationService constructor.
     *
     * @param UserJobInformationRepository $userJobInformationRepository
     */
    public function __construct(UserJobInformationRepository $userJobInformationRepository)
    {
        parent::__construct($userJobInformationRepository);
    }

    /**
     * @param int $userId
     * @param int $id
     * @return Model
     */
    public function getItemByUserIdAndId(int $userId, int $id): Model
    {
        return $this->modelRepository->getItemByUserIdAndId($userId, $id);
    }
}
