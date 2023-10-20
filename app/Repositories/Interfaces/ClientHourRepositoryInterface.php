<?php
namespace App\Repositories\Interfaces;

interface ClientHourRepositoryInterface
{
    /**
     * @param string $date
     * @param int $userId
     * @return mixed
     */
    public function removeByDateAndUserId(string $date, int $userId);
}
