<?php

namespace App\Services;

use App\Repositories\TechnologyRepository;
use App\Services\Interfaces\TechnologyServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class TechnologyService extends BaseService implements TechnologyServiceInterface
{
    /**
     * TechnologyService constructor.
     *
     * @param TechnologyRepository $technologyRepository
     */
    public function __construct(TechnologyRepository $technologyRepository)
    {
        parent::__construct($technologyRepository);
    }

    /**
     * Get All Project Technology Ids.
     * @param array $names
     * @return array
     */
    public function getTechnologyIdsByNames(array $names): array
    {
        return $this->modelRepository->technologyIdsByNames($names);
    }

    /**
     * Create New User Project Roles.
     * @param $data
     * @return array
     */
    public function createNewTechnology($data): array
    {
        $allTechnology = $this->modelRepository->allTechnologyNames();
        $nowTime = Carbon::now();
        $technologyToAdd = [];
        $projectTechnologyNames = [];
        foreach ($data as $projectTechnology) {
            if (!in_array($projectTechnology, $allTechnology)) {
                $technologyToAdd[] = [
                    'name' => $projectTechnology,
                    'created_at' => $nowTime,
                    'updated_at' => $nowTime,
                ];
                $projectTechnologyNames[] = $projectTechnology;
            }
        }

        if (count($technologyToAdd) > 0) {
            $this->modelRepository->insert($technologyToAdd);
        }

        return $projectTechnologyNames;
    }
}
