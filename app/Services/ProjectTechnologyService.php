<?php

namespace App\Services;

use App\Repositories\ProjectTechnologyRepository;
use App\Services\Interfaces\ProjectTechnologyServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class ProjectTechnologyService extends BaseService implements ProjectTechnologyServiceInterface
{
    /**
     * ProjectTechnologyService constructor.
     *
     * @param ProjectTechnologyRepository $projectTechnologyRepository
     */
    public function __construct(ProjectTechnologyRepository $projectTechnologyRepository)
    {
        parent::__construct($projectTechnologyRepository);
    }

    /**
     * Create New Project Technology.
     * @param $data
     * @param $projectId
     * @return bool
     */
    public function createNewProjectTechnology($data, $projectId): ?bool
    {
        $nowTime = Carbon::now();
        $projectTechnologyDataToSave = [];
        foreach ($data as $technologyId) {
            $projectTechnologyDataToSave[] = [
                "technology_id" => $technologyId,
                "project_id" => $projectId,
                "date" => $nowTime->format('Y-m-d'),
                'created_at' => $nowTime,
                'updated_at' => $nowTime,
            ];
        }

        if (count($projectTechnologyDataToSave) > 0) {
            return $this->modelRepository->insert($projectTechnologyDataToSave);
        }
    }

    /**
     * Get Existing Project Technology Ids.
     * @param int $projectId
     * @return array
     */
    public function getExistingProjectTechnologyIds(int $projectId): array
    {
        return $this->modelRepository->projectTechnologyIdsByProjectId($projectId);
    }

    /**
     * Delete Project Technology by Ids.
     * @param int $projectId
     * @param array $technologyIds
     * @return int
     */
    public function deleteProjectTechnology(int $projectId, array $technologyIds = []): int
    {
        return $this->modelRepository->deleteProjectTechnology($projectId, $technologyIds);
    }
}
