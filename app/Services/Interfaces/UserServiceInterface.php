<?php

namespace App\Services\Interfaces;

use App\Http\Requests\UsersListRequest;
use App\Models\UserBonus;
use App\Models\UserSalary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface UserServiceInterface
{
    /**
     * @param string $email
     * @return Model
     */
    public function findByEmail(string $email): Model;

    /**
     * @param UsersListRequest $request
     * @param array $roleIds
     * @return array|LengthAwarePaginator
     */
    public function list(UsersListRequest $request, array $roleIds = [], $showAllRoles = true): LengthAwarePaginator;

    /**
     * @return Collection
     */
    public function activeUsersWithTeams(): Collection;

    /**
     * @param array $fields
     * @return Collection
     */
    public function getUsers(array $fields): Collection;

    /**
     * @param array $fields
     * @return Collection
     */
    public function getActiveUsers(array $fields): Collection;

    /**
     * get user education information
     * @param int $userId
     * @return Model
     */
    public function getUserEducationInfoData(int $userId): Model;

    /**
     * @param array $userIds
     * @param string $userStatus
     * @return array
     */
    public function getUserIdsByIdsAndStatus(array $userIds, string $userStatus): array;

    /**
     * @param string $userStatus
     * @return array
     */
    public function getUserIdsByStatus(string $userStatus): array;

    /**
     * @param int $userId
     * @param array $select
     * @return Model
     */
    public function selectUserById(int $userId, array $select): ?Model;

    /**
     * @return array
     */
    public function getAllUserIds(): array;

    /**
     * @param string $userEmail
     * @return object
     */
    public function getUserByEmail(string $userEmail);

    /**
     * @param string $email
     * @param string $password
     */
    public function
    updateUserPassword(string $email, string $password);

    /**
     * @param string $email
     * @return bool
     */
    public function checkActiveUserByEmail(string $email): bool;

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @param bool $isProject
     * @return mixed
     */
    public function getFullCalendarData(int $userId, string $start, string $end, string $utcOffset = '+00:00', bool $isProject = false);

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return mixed
     */
    public function getFullCalendarTags(int $userId, string $start, string $end, string $utcOffset = '+00:00');

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserForCalendarView(int $userId);

    /**
     * @param object $data
     * @return object
     */
    public function userRegistration(object $data): object;

    /**
     * @param int $userId
     */
    public function getUserById(int $userId);

    /**
     * @param int $userId
     * @return bool
     */
    public function deleteUser(int $userId): bool;

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserCasualInformation(int $userId);

    /**
     * @param object $request
     * @return bool
     */
    public function createUserCasualInformation(object $request): bool;

    /**
     * @param object $request
     * @return bool
     */
    public function updateUserCasualInformation(object $request): bool;

    /**
     * @param int $userId
     * @param int $casualId
     * @return bool
     */
    public function deleteUserCasualInformation(int $userId, int $casualId): bool;

    /**
     * @param object $request
     * @param int $id
     * @param string $eventId
     * @return mixed
     */
    public function updateOrCreateNotesInformation(object $request, int $id, string $eventId = null);

    /**
     * @param int $userId
     * @return array
     */
    public function getNoteForActiveUsers(int $userId): array;

    /**
     * @param int $userId
     * @param array $spouseData
     * @return mixed
     */
    public function createOrUpdateSpouseData(int $userId, array $spouseData);

    /**
     * @param int $userId
     * @param int $status
     * @return bool
     */
    public function changeUserStatus(int $userId, int $status): bool;

    /**
     * @param array $userIds
     * @return mixed
     */
    public function getUserPositionsByUserIds(array $userIds);

    /**
     * @return mixed
     */
    public function getUserJobTypes();

    /**
     * @return mixed
     */
    public function getUserLevels();

    /**
     * @param int $salaryId
     * @param int $userId
     * @return mixed
     */
    public function getUserSalaryById(int $salaryId, int $userId);

    /**
     * @param UserSalary $salary
     * @param array $data
     * @return UserSalary
     */
    public function updateUserSalary(UserSalary $salary, array $data): UserSalary;

    /**
     * @param array $ids
     * @param int $userId
     * @return mixed
     */
    public function removeUserSalaries(array $ids, int $userId);

    /**
     * @param array $data
     * @return UserSalary
     */
    public function addUserSalary(array $data): UserSalary;

    /**
     * @param int $userId
     * @return array
     */
    public function getUserSalaryIds(int $userId): array;


    /**
     * @param int $bonusId
     * @param int $userId
     * @return mixed
     */
    public function getUserBonusById(int $bonusId, int $userId);

    /**
     * @param int $userId
     * @return array
     */
    public function getUserBonusIds(int $userId): array;

    /**
     * @param UserBonus $bonus
     * @param array $data
     * @return UserBonus
     */
    public function updateUserBonus(UserBonus $bonus, array $data): UserBonus;

    /**
     * @param array $data
     * @return UserBonus
     */
    public function addUserBonus(array $data): UserBonus;

    /**
     * @param array $ids
     * @param int $userId
     * @return mixed
     */
    public function removeUserBonuses(array $ids, int $userId);

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserCountKids(int $userId);

    /**
     * @param int $id
     * @return mixed
     */
    public function getNote(int $id);

    /**
     * @param string $uuId
     * @return mixed
     */
    public function removeNote(string $uuId);

    /**
     * @param int $userId
     * @param string $userEmail
     * @return bool
     */
    public function updateUserEmail(int $userId, string $userEmail): bool;

    /**
     * @param int $userId
     * @param string|null $userProfessionalStory
     * @return mixed
     */
    public function updateUserProfessionalStory(int $userId, string $userProfessionalStory);

    /**
     * @param int $salaryId
     * @param int $userId
     * @return bool
     */
    public function deleteUserSalary(int $salaryId, int $userId): bool;

    /**
     * @param int $salaryId
     * @param int $userId
     * @param string $type
     * @return bool
     */
    public function deleteUserBonus(int $salaryId, int $userId, string $type): bool;

    /**
     * @return object
     */
    public function getQuerySkills(): object;

    /**
     * @param array $skillData
     * @return mixed
     */
    public function insertAndGetInsertedSkillIds(array $skillData);

    /**
     * @param array $skillIds
     * @return array
     */
    public function getCheckedSkillIds(array $skillIds): array;

    /**
     * @param int $userId
     * @return array
     */
    public function getExistingSkillsIds(int $userId): array;

    /**
     * @param int $userId
     * @param array $skillsToDelete
     * @return bool
     */
    public function deleteUserSkills(int $userId, array $skillsToDelete): bool;

    /**
     * @param int $userId
     * @param array $skillIds
     * @return mixed
     */
    public function insertUserSkills(int $userId, array $skillIds);

    /**
     * @return object
     */
    public function getQuerySoftSkills(): object;

    /**
     * @param array $softSkillData
     * @return mixed
     */
    public function insertAndGetInsertedSoftSkillIds(array $softSkillData);

    /**
     * @param array $softSkillIds
     * @return array
     */
    public function getCheckedSoftSkillIds(array $softSkillIds): array;

    /**
     * @param int $userId
     * @return array
     */
    public function getExistingSoftSkillsIds(int $userId): array;

    /**
     * @param int $userId
     * @param array $softSkillsToDelete
     * @return bool
     */
    public function deleteUserSoftSkills(int $userId, array $softSkillsToDelete): bool;

    /**
     * @param int $userId
     * @param array $softSkillIds
     * @return mixed
     */
    public function insertUserSoftSkills(int $userId, array $softSkillIds);
}
