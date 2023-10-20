<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface WorkRepositoryInterface
{
    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function getTodayWorksQuery(int $userId, string $startDateTime, string $endDateTime);

    /**
     * @param int $userId
     * @return mixed
     */
    public function getWorkTimeIdsByUserId(int $userId);

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function stoppedTotalDuration(int $userId, string $startDateTime, string $endDateTime);

    /**
     * @param string $name
     * @param int $userId
     * @param int|null $projectId
     * @return mixed
     */
    public function getWorkByName(string $name, int $userId, int $projectId = null);

    /**
     * @param int $id
     * @return Builder|Model|object|null
     */
    public function getWorkWithTimesById(int $id);

    /**
     * @param int $userId
     * @param string $startDateTime
     * @param string $endDateTime
     * @return Collection
     */
    public function getWorksData(int $userId, string $startDateTime, string $endDateTime): Collection;
}
