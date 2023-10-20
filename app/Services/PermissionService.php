<?php

namespace App\Services;

use App\Repositories\PermissionRepository;
use App\Services\Interfaces\PermissionServiceInterface;


class PermissionService extends BaseService implements PermissionServiceInterface
{
    /**
     * RoleService constructor.
     *
     * @param PermissionRepository $permissionRepository
     */
    public function __construct(PermissionRepository $permissionRepository)
    {
        parent::__construct($permissionRepository);
    }

    /**
     * @param string $name
     * @return mixed
     */
    public function getItemByName(string $name)
    {
        return $this->modelRepository->getItemByName($name);
    }
}
