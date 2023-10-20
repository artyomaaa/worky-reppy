<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface UserVacationServiceInterface
{
    /**
     * Get vacations info.
     * @param int $userId
     * @return Collection
     */
    public function getVacationsData(int $userId): ?Collection;

    /**
     * Get vacations info.
     * @param int $id
     * @param int $userId
     * @return Model
     */
    public function getVacationByIdAndUserId(int $id, int $userId): ?Model;

    /**
     * @param $request
     * @param int $id
     * @return bool
     */
    public function updateVacation($request, int $id): bool;

    /**
     * Create user vacation.
     *
     * @param $request
     * @return Model
     */
    public function createVacation($request): ?Model;
}
