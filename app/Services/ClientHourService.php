<?php

namespace App\Services;

use App\Repositories\ClientHourRepository;
use App\Services\Interfaces\ClientHourServiceInterface;

class ClientHourService extends BaseService implements ClientHourServiceInterface
{
    /**
     * RoleService constructor.
     *
     * @param ClientHourRepository $clientHourRepository
     */
    public function __construct(ClientHourRepository $clientHourRepository)
    {
        parent::__construct($clientHourRepository);
    }

    /**
     * @param string $date
     * @param int $userId
     * @return mixed
     */
    public function removeByDateAndUserId(string $date, int $userId)
    {
        return $this->modelRepository->removeByDateAndUserId($date, $userId);
    }
}
