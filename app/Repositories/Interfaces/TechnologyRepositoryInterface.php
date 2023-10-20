<?php
namespace App\Repositories\Interfaces;

interface TechnologyRepositoryInterface
{
    /**
     * Get All Project Technology Ids.
     * @param array $names
     * @return array
     */
    public function technologyIdsByNames(array $names): array;

    /**
     * Get All Technology Names.
     * @return array
     */
    public function allTechnologyNames(): array;
}
