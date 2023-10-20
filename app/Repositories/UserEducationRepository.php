<?php

namespace App\Repositories;

use App\Models\UserEducation;
use App\Repositories\Interfaces\UserEducationRepositoryInterface;

class UserEducationRepository extends BaseRepository implements UserEducationRepositoryInterface
{
    /**
     * UserEducationRepository constructor.
     *
     * @param UserEducation $model
     */
    public function __construct(UserEducation $model)
    {
        parent::__construct($model);
    }

    /**
     * add Collage info to db
     * @param object $request
     * @return bool
     */
    public function createCollegeInformation(object $request): bool
    {
        $collegeInformationCreateData = [
            "user_id" => $request->id ?? null,
            "type" => $request->type ?? null,
            "education_institution" => $request->school ?? null,
            "degree" => $request->degree ?? null,
            "faculty_and_department" => $request->faculty_of_study ?? null,
            "profession" => $request->field_of_study ?? null,
            "from" => $request->starting_from ?? null,
            "to" => $request->ending_in ?? null,
            "description" => $request->description ?? null,
        ];
        return (bool)$this->create($collegeInformationCreateData);
    }

    /**
     * add Collage info to db
     * @param object $request
     * @return bool
     */
    public function updateCollegeInformation(object $request): bool
    {
        $collegeInformationUpdateData = [
            "user_id" => $request->id ?? null,
            "type" => $request->type ?? null,
            "education_institution" => $request->school ?? null,
            "degree" => $request->degree ?? null,
            "faculty_and_department" => $request->faculty_of_study ?? null,
            "profession" => $request->field_of_study ?? null,
            "from" => $request->starting_from ?? null,
            "to" => $request->ending_in ?? null,
            "description" => $request->description ?? null,
        ];
        return $this->update($collegeInformationUpdateData, $request->formId);
    }

    /**
     * add School info to db
     * @param object $request
     * @return bool
     */
    public function createSchoolInformation(object $request): bool
    {
        $schoolInformationCreateData = [
            "user_id" => $request->id ?? null,
            "type" => $request->type ?? null,
            "education_institution" => $request->school_name ?? null,
            "from" => $request->starting_from ?? null,
            "to" => $request->ending_in ?? null,
        ];
        return (bool)$this->create($schoolInformationCreateData);
    }

    /**
     * add Collage info to db
     * @param object $request
     * @return bool
     */
    public function updateSchoolInformation(object $request): bool
    {
        $schoolInformationUpdateData = [
            "user_id" => $request->id ?? null,
            "type" => $request->type ?? null,
            "education_institution" => $request->school_name ?? null,
            "from" => $request->starting_from ?? null,
            "to" => $request->ending_in ?? null,
        ];
        return $this->update($schoolInformationUpdateData, $request->formId);
    }

    /**
     * add University info to db
     * @param object $request
     * @return bool
     */
    public function createUniversityInformation(object $request): bool
    {
        $universityInformationCreateData = [
            'user_id' => $request->id ?? null,
            'type' => $request->type ?? null,
            'degree' => $request->degree ?? null,
            'faculty_and_department' => $request->faculty_of_study ?? null,
            'profession' => $request->field_of_study ?? null,
            'education_institution' => $request->school ?? null,
            'from' => $request->starting_from ?? null,
            'to' => $request->ending_in ?? null,
        ];
        return (bool)$this->create($universityInformationCreateData);
    }

    /**
     * update University info to db
     * @param object $request
     * @return bool
     */
    public function updateUniversityInformation(object $request): bool
    {
        $universityInformationUpdateData = [
            'user_id' => $request->id ?? null,
            'type' => $request->type ?? null,
            'degree' => $request->degree ?? null,
            'faculty_and_department' => $request->faculty_of_study ?? null,
            'profession' => $request->field_of_study ?? null,
            'education_institution' => $request->school ?? null,
            'from' => $request->starting_from ?? null,
            'to' => $request->ending_in ?? null,
        ];
        return $this->update($universityInformationUpdateData, $request->formId);
    }

    /**
     * add Military info to db
     * @param object $request
     * @return bool
     */
    public function createMilitaryInformation(object $request): bool
    {
        $militaryInformationCreateData = [
            "user_id" => $request->id ?? null,
            "type" => $request->type ?? null,
            "education_institution" => $request->branch_of_service ?? null,
            "profession" => $request->rank_at_discharge ?? null,
            "from" => $request->started_date ?? null,
            "to" => $request->end_date ?? null,
        ];
        return (bool)$this->create($militaryInformationCreateData);
    }

    /**
     * update Military info to db
     * @param object $request
     * @return bool
     */
    public function updateMilitaryInformation(object $request): bool
    {
        $militaryInformationUpdateData = [
            "user_id" => $request->id ?? null,
            "type" => $request->type ?? null,
            "education_institution" => $request->branch_of_service ?? null,
            "profession" => $request->rank_at_discharge ?? null,
            "from" => $request->started_date ?? null,
            "to" => $request->end_date ?? null,
        ];
        return $this->update($militaryInformationUpdateData, $request->formId);
    }

    /**
     * remove Education from  db
     * @param object $request
     * @return bool
     */
    public function removeEducation(object $request): bool
    {
        return $this->model->where([
            ['user_id', '=', $request->user_id],
            ['type', '=', $request->type],
            ['id', '=', $request->edu_id],
        ])->delete();
    }
}
