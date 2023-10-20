<?php

namespace App\Services\Interfaces;

interface TechnologyServiceInterface
{
    /**
     * Get All Project Technology Ids.
     * @param array $names
     * @return array
     */
    public function getTechnologyIdsByNames(array $names): array;

    /**
     * Create New User Project Roles.
     * @param $data
     * @return array
     */
    public function createNewTechnology($data): array;
}
