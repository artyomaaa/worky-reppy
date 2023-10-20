<?php
namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface ProjectRepositoryInterface
{
    /**
     * @return Collection
     */
    public function activeProjects(): Collection;

    /**
     * @return array
     */
    public function getAllProjectIds(): array;

    /**
     * get project ids by user id.
     * @param int $userId
     * @return array
     */
    public function getProjectIdsByUserId(int $userId): array;

    /**
     * Get query.
     * @return Builder
     */
    public function getQuery(): Builder;

    /**
     * Get model.
     * @return Model
     */
    public function getModel(): Model;

    /**
     * Get statuses.
     * @return array
     */
    public function getStatuses(): array;

    /**
     * @param int $projectId
     * @return mixed
     */
    public function getMembers(int $projectId);

    /**
     * @param array $projectIds
     * @return mixed
     */
    public function getUserAttachedProjectsQuery(array $projectIds);

    /**
     * @return mixed
     */
    public function getAllProjectsQuery();
}
