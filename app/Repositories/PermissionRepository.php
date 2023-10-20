<?php

namespace App\Repositories;

use App\Models\Permission;
use App\Repositories\Interfaces\PermissionRepositoryInterface;

class PermissionRepository extends BaseRepository implements PermissionRepositoryInterface
{

    /**
     * UserRepository constructor.
     *
     * @param Permission $model
     */
    public function __construct(Permission $model)
    {
        parent::__construct($model);
    }

    /**
     * @param string $name
     * @return mixed
     */
    public function getItemByName(string $name)
    {
        return $this->model->where('name', $name)->first();
    }
}
