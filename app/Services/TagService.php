<?php

namespace App\Services;

use App\Repositories\TagRepository;
use App\Services\Interfaces\TagServiceInterface;
use Illuminate\Support\Collection;

class TagService extends BaseService implements TagServiceInterface
{
    /**
     * TagService constructor.
     *
     * @param TagRepository $tagRepository
     */
    public function __construct(TagRepository $tagRepository)
    {
        parent::__construct($tagRepository);
    }

    /**
     * @param array $ids
     * @return Collection
     */
    public function getTagsByIds(array $ids): Collection
    {
        return $this->modelRepository->getTagsByIds($ids);
    }

    /**
     * @param int $userId
     * @return Collection
     */
    public function getTagsByUserId(int $userId): Collection
    {
        return $this->modelRepository->getTagsByUserId($userId);
    }

    /**
     * @param array $workIds
     * @return Collection
     */
    public function getTagsByWorkId(array $workIds): Collection
    {
        return $this->modelRepository->getTagsByWorkId($workIds);
    }
}
