<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface UserVacationRepositoryInterface
{
    /**
     * Get vacations info.
     * @param int $userId
     * @return Collection
     */
    public function getVacationsByUserId(int $userId): ?Collection;

    /**
     * Get vacations info.
     * @param int $id
     * @param int $userId
     * @return Model
     */
    public function getVacationByIdAndUserId(int $id, int $userId): ?Model;

    /**
     * Update vacation info.
     * @param int $id
     * @param array $attributes
     * @return bool
     */
    public function updateVacation(int $id, array $attributes): ?bool;
}
