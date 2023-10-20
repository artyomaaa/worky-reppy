<?php

namespace App\Repositories\Interfaces;

interface UserEducationRepositoryInterface
{
    /**
     * add Collage info to db
     * @param object $request
     * @return bool
     */
    public function createCollegeInformation(object $request): bool;

    /**
     * update Collage info to db
     * @param object $request
     * @return bool
     */
    public function updateCollegeInformation(object $request): bool;

    /**
     * add School info to db
     * @param object $request
     * @return bool
     */
    public function createSchoolInformation(object $request): bool;

    /**
     * update School info to db
     * @param object $request
     * @return bool
     */
    public function updateSchoolInformation(object $request): bool;

    /**
     * add University info to db
     * @param object $request
     * @return bool
     */
    public function createUniversityInformation(object $request): bool;

    /**
     * update University info to db
     * @param object $request
     * @return bool
     */
    public function updateUniversityInformation(object $request): bool;

    /**
     * add Military info to db
     * @param object $request
     * @return bool
     */
    public function createMilitaryInformation(object $request): bool;

    /**
     * update Military info to db
     * @param object $request
     * @return bool
     */
    public function updateMilitaryInformation(object $request): bool;

    /**
     * remove Education from  db
     * @param object $request
     * @return bool
     */
    public function removeEducation(object $request): bool;
}
