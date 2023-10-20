<?php

namespace App\Services\Interfaces;

interface ClientHourServiceInterface
{
    /**
     * @param string $date
     * @param int $userId
     * @return mixed
     */
    public function removeByDateAndUserId(string $date, int $userId);
}
