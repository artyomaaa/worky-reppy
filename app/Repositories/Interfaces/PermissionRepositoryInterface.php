<?php
namespace App\Repositories\Interfaces;

interface PermissionRepositoryInterface
{
    /**
     * @param string $name
     * @return mixed
     */
    public function getItemByName(string $name);
}
