<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Builder;

interface TodoServiceInterface
{
    /**
     * Get statuses.
     * @return array
     */
    public function getStatuses(): array;

    /**
     * Get filtered query.
     * @param $request
     * @param $loggedUser
     * @return Builder
     */
    public function getFilteredQuery($request, $loggedUser): Builder;

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return mixed
     */
    public function getFullCalendarTodos(int $userId, string $start, string $end, string $utcOffset = '+00:00');

    /**
     * @param int $userId
     * @return int
     */
    public function getTotalTodos(int $userId): int;
}
