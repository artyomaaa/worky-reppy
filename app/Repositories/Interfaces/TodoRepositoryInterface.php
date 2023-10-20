<?php
namespace App\Repositories\Interfaces;

interface TodoRepositoryInterface
{
    /**
     * Get statuses.
     * @return array
     */
    public function getStatuses(): array;

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @return mixed
     */
    public function getFullCalendarTodos(int $userId, string $start, string $end);

    /**
     * @param int $userId
     * @return int
     */
    public function getTotalTodos(int $userId): int;
}
