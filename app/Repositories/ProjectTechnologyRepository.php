<?php

namespace App\Repositories;

use App\Models\ProjectTechnology;
use App\Repositories\Interfaces\ProjectTechnologyRepositoryInterface;

class ProjectTechnologyRepository extends BaseRepository implements ProjectTechnologyRepositoryInterface
{
    /**
     * ProjectTechnologyRepository constructor.
     *
     * @param ProjectTechnology $model
     */
    public function __construct(ProjectTechnology $model)
    {
        parent::__construct($model);
    }

    /**
     * Get Existing Project Technology Ids.
     * @param int $projectId
     * @return array
     */
    public function projectTechnologyIdsByProjectId(int $projectId): array
    {
        return $this->model->where('project_id', $projectId)->pluck('technology_id')->toArray();
    }

    /**
     * Delete Project Technology by Ids.
     * @param int $projectId
     * @param array $technologyIds
     * @return int
     */
    public function deleteProjectTechnology(int $projectId, array $technologyIds = []): int
    {
        $query = $this->model->where('project_id', $projectId);

        if (count($technologyIds) > 0) {
            $query = $query->whereIn('technology_id', $technologyIds);
        }
        return $query->delete();
    }
}
