<?php

namespace App\Services\Interfaces;

interface UserLanguageServiceInterface
{
    /**
     * add Language info to db
     * @param $request
     * @return bool
     */
    public function updateOrCreateLanguageInformation($request): bool;
}
