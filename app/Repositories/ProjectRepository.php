<?php

namespace App\Repositories;

use App\Models\Project;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ProjectRepository extends BaseRepository implements ProjectRepositoryInterface
{

    /**
     * UserRepository constructor.
     *
     * @param Project $model
     */
    public function __construct(Project $model)
    {
        parent::__construct($model);
    }

    /**
     * @return Collection
     */
    public function activeProjects(): Collection
    {
        return $this->model->active()->get();
    }

    /**
     * @return array
     */
    public function getAllProjectIds(): array
    {
        return $this->model->pluck('id')->toArray();
    }

    /**
     * get project ids by user id.
     * @param int $userId
     * @return array
     */
    public function getProjectIdsByUserId(int $userId): array
    {
        return $this->model->getProjectIdsByUserId($userId);
    }

    /**
     * Get model.
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->model;
    }

    /**
     * Get statuses.
     * @return array
     */
    public function getStatuses(): array
    {
        return [$this->model::INACTIVE, $this->model::ACTIVE, $this->model::ARCHIVED];
    }

    /**
     * @param int $projectId
     * @return mixed
     */
    public function getMembers(int $projectId)
    {
        return $this->model->where('id', $projectId)->first()->attached_users;
    }


    /**
     * @param array $projectIds
     * @return mixed
     */
    public function getUserAttachedProjectsQuery(array $projectIds)
    {
        return $this->model->getUserAttachedProjectsQuery($projectIds);
    }

    /**
     * @return mixed
     */
    public function getAllProjectsQuery()
    {
        return $this->model->getAllProjectsQuery();
    }
}
