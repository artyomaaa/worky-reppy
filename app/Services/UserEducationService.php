<?php

namespace App\Services;

use App\Repositories\UserEducationRepository;
use App\Services\Interfaces\UserEducationServiceInterface;

class UserEducationService extends BaseService implements UserEducationServiceInterface
{
    /**
     * UserEducationService constructor.
     *
     * @param UserEducationRepository $userEducationRepository
     */
    public function __construct(UserEducationRepository $userEducationRepository)
    {
        parent::__construct($userEducationRepository);
    }

    /**
     * add Collage info to db
     * @param object $request
     * @return bool
     */
    public function createCollegeInformation(object $request): bool
    {
        return $this->modelRepository->createCollegeInformation($request);
    }

    /**
     * update Collage info to db
     * @param object $request
     * @return bool
     */
    public function updateCollegeInformation(object $request): bool
    {
        return $this->modelRepository->updateCollegeInformation($request);
    }

    /**
     * add School info to db
     * @param object $request
     * @return bool
     */
    public function createSchoolInformation(object $request): bool
    {
        return $this->modelRepository->createSchoolInformation($request);
    }

    /**
     * update Collage info to db
     * @param object $request
     * @return bool
     */
    public function updateSchoolInformation(object $request): bool
    {
        return $this->modelRepository->updateSchoolInformation($request);
    }

    /**
     * add University info to db
     * @param object $request
     * @return bool
     */
    public function createUniversityInformation(object $request): bool
    {
        return $this->modelRepository->createUniversityInformation($request);
    }

    /**
     * edit University info to db
     * @param object $request
     * @return bool
     */
    public function updateUniversityInformation(object $request): bool
    {
        return $this->modelRepository->updateUniversityInformation($request);
    }

    /**
     * add Military info to db
     * @param object $request
     * @return bool
     */
    public function createMilitaryInformation(object $request): bool
    {
        return $this->modelRepository->createMilitaryInformation($request);
    }

    /**
     * update Military info to db
     * @param object $request
     * @return bool
     */
    public function updateMilitaryInformation(object $request): bool
    {
        return $this->modelRepository->updateMilitaryInformation($request);
    }

    /**
     * remove Education from  db
     * @param object $request
     * @return bool
     */
    public function removeEducation(object $request): bool
    {
        return $this->modelRepository->removeEducation($request);
    }
}
