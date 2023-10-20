<?php

namespace App\Services\Interfaces;

interface ProjectTechnologyServiceInterface
{
    /**
     * Create New Project Technology.
     * @param $data
     * @param $projectId
     * @return bool
     */
    public function createNewProjectTechnology($data, $projectId): ?bool;

    /**
     * Get Existing Project Technology Ids.
     * @param int $projectId
     * @return array
     */
    public function getExistingProjectTechnologyIds(int $projectId): array;

    /**
     * Delete Project Technology by Ids.
     * @param int $projectId
     * @param array $technologyIds
     * @return int
     */
    public function deleteProjectTechnology(int $projectId, array $technologyIds = []): int;
}
