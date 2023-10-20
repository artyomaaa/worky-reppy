<?php

namespace App\Repositories;

use App\Models\Technology;
use App\Repositories\Interfaces\TechnologyRepositoryInterface;
use Illuminate\Support\Collection;

class TechnologyRepository extends BaseRepository implements TechnologyRepositoryInterface
{
    /**
     * TechnologyRepository constructor.
     *
     * @param Technology $model
     */
    public function __construct(Technology $model)
    {
        parent::__construct($model);
    }

    /**
     * Get All Project Technology Ids.
     * @param array $names
     * @return array
     */
    public function technologyIdsByNames(array $names): array
    {
        return $this->model->whereIn(\DB::raw('BINARY `name`'), $names)->pluck('id')->toArray();
    }

    /**
     * Get All Technology Names.
     * @return array
     */
    public function allTechnologyNames(): array
    {
        return $this->model->all()->pluck('name')->toArray();
    }
}
