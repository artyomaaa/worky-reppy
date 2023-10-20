<?php

namespace App\Services\Interfaces;

interface PermissionServiceInterface
{
    /**
     * @param string $name
     * @return mixed
     */
    public function getItemByName(string $name);
}
