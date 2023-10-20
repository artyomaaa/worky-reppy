<?php

namespace App\Services\Interfaces;

use Illuminate\Support\Collection;

interface TagServiceInterface
{
    /**
     * @param array $ids
     * @return Collection
     */
    public function getTagsByIds(array $ids): Collection;

    /**
     * @param int $userId
     * @return Collection
     */
    public function getTagsByUserId(int $userId): Collection;

    /**
     * @param array $workIds
     * @return Collection
     */
    public function getTagsByWorkId(array $workIds): Collection;
}
