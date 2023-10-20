<?php

namespace App\Services\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface ProjectServiceInterface
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
     * @param Builder $query
     * @return Collection
     */
    public function getProjectsItems(Builder $query): Collection;

    /**
     * Get filtered query.
     * @param $request
     * @param $loggedUser
     * @return Builder
     */
    public function getFilteredQuery($request, $loggedUser): Builder;

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
     * Get statuses.
     * @param array $data
     * @return Model
     */
    public function createProject(array $data): Model;

    /**
     * @param $request
     * @param int $id
     * @return bool
     */
    public function updateProject($request, int $id): bool;

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
     * @return  mixed
     */
    public function getAllProjectsQuery();
}
