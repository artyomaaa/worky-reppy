<?php
namespace App\Repositories\Interfaces;

interface ProjectTechnologyRepositoryInterface
{
    /**
     * Get Existing Project Technology Ids.
     * @param int $projectId
     * @return array
     */
    public function projectTechnologyIdsByProjectId(int $projectId): array;

    /**
     * Delete Project Technology by Ids.
     * @param int $projectId
     * @param array $technologyIds
     * @return int
     */
    public function deleteProjectTechnology(int $projectId, array $technologyIds = []): int;
}
