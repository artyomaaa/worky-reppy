<?php

namespace App\Repositories;

use App\Models\Skill;
use App\Models\SoftSkill;
use App\Models\User;
use App\Models\UserBonus;
use App\Models\UserCasual;
use App\Models\UserRelative;
use App\Models\UserNote;
use App\Models\UserSalary;
use App\Models\UserSkill;
use App\Models\UserSoftSkill;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    /**
     * UserRepository constructor.
     *
     * @param User $model
     */
    public function __construct(User $model)
    {
        parent::__construct($model);
    }


    /**
     * @param string $email
     * @return Model
     */
    public function findByEmail(string $email): Model
    {
        return $this->model->where('email', $email)->first();
    }

    /**
     * @param int $id
     * @return Model
     */
    public function findByIdWithRolesAndPermissions(int $id): Model
    {
        return $this->model->where('id', $id)
            ->with(['roles' => function ($q) {
                $q->with(['permissions' => function($q) {
                    $q->select('id', 'name', 'guard_name');
                }]);
                $q->select('id', 'name', 'priority');
            }])
            ->first();
    }

    /**
     * @return Builder
     */
    public function queryWithRolesPermissionsContacts(): Builder
    {
        return $this->model->with('roles')->with('permissions')->with('contacts');
    }

    /**
     * @return Collection
     */
    public function activeUsersWithTeams(): Collection
    {
        return $this->model->active()->with('teams')->get(['id', 'name', 'avatar']);
    }

    /**
     * @param array $fields
     * @return Collection
     */
    public function activeUsers(array $fields): Collection
    {
        return $this->model->active()->get($fields);
    }

    /**
     * @param array $fields
     * @return Collection
     */
    public function getUsers(array $fields): Collection
    {
        return $this->model->get($fields)->each(function ($user) {
            $user->setAppends([]);
        });
    }

    /**
     * @param int $userId
     * @param array $currentPageSelectFields
     * @return Builder
     */
    public function selectUserByIdWithFields(int $userId, array $currentPageSelectFields): Builder
    {
        return $this->model->select($currentPageSelectFields)->where('id', $userId);
    }

    /**
     * get user education information
     * @param $userId
     * @return Model
     */
    public function getUserEducationInfoData($userId): Model
    {
        $eduInfoSelectFields = [
            'id',
            'status',
            'name',
            'surname',
            'patronymic',
            'email',
            'birthday',
            'gender',
            'nationality',
            'about',
            'time_offset',
            'family_status',
            'amountOfKids'
        ];
        return $this->selectUserByIdWithFields($userId, $eduInfoSelectFields)
            ->with('educations')->with('languages')->first();
    }

    /**
     * @param array $userIds
     * @param string $userStatus
     * @return array
     */
    public function getUserIdsByIdsAndStatus(array $userIds, string $userStatus): array
    {
        return $this->model->whereIn('id', $userIds)->where('status', $userStatus)->pluck('id')->toArray();
    }

    /**
     * @param string $userStatus
     * @return array
     */
    public function getUserIdsByStatus(string $userStatus): array
    {
        return $this->model->where('status', $userStatus)->pluck('id')->toArray();
    }

    /**
     * @return array
     */
    public function getAllUserIds(): array
    {
        return $this->model->pluck('id')->toArray();
    }

    /**
     * @param int $userId
     * @param array $select
     * @return Model
     */
    public function selectUserById(int $userId, array $select): ?Model
    {
        return $this->model->select($select)->where('id', $userId)->first();
    }

    /**
     * @param string $email
     * @return bool
     */
    public function checkActiveUserByEmail(string $email): bool
    {
        return $this->model->checkActiveUserByEmail($email);
    }

    /**
     * @param string $email
     * @param string $password
     */
    public function updateUserPassword(string $email, string $password)
    {
        return $this->model->updateUserPassword($email, $password);
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return mixed
     */
    public function getFullCalendarData(int $userId, string $start, string $end, string $utcOffset = '+00:00')
    {
        return \DB::table('reports_view')
            ->where('work_user_id', $userId)
            ->where('start_date_time', '>=', $start)
            ->where(function($q) use ($start, $end, $utcOffset) {
                $q->where('end_date_time', '<=', $end);

                $nowTime = Carbon::now($utcOffset);
                if ($nowTime >= Carbon::parse($start, $utcOffset) && $nowTime <= Carbon::parse($end, $utcOffset)) {
                    $q->orWhereNull('end_date_time');
                }
            })
            ->get([
                'start_date_time',
                'end_date_time',
                'duration',
                'work_id',
                'work_name',
                'work_user_id',
                'work_time_id',
                'task_description',
                'project_id',
                'project_name',
                'project_color',
            ]);
    }

    /**
     * @param int $userId
     * @param array $workTimeIds
     * @return mixed
     */
    public function getTagListByUserIdWorkTimeIds(int $userId, array $workTimeIds = [])
    {
        $q = \DB::table('work_times_tags')
            ->join('work_times', 'work_times.id', '=', 'work_times_tags.work_time_id')
            ->join('tags', 'tags.id', '=', 'work_times_tags.tag_id')
            ->join('works', 'works.id', '=', 'work_times.work_id')
            ->where('works.user_id', $userId);

        if (!empty($workTimeIds)) {
            $q->whereIn('work_times_tags.work_time_id', $workTimeIds);
        }

        return $q->get([
            'tags.id',
            'tags.name',
            'tags.color',
            'work_times.work_id',
            'work_times_tags.work_time_id',
        ]);
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return mixed
     */
    public function getFullCalendarTags(int $userId, string $start, string $end, string $utcOffset = '+00:00')
    {
        $workTimeIds = $this->getTagListByUserIdWorkTimeIds($userId)
            ->pluck('work_time_id')
            ->toArray();

        return \DB::table('reports_view')
            ->leftJoin('work_times_tags', 'reports_view.work_time_id', '=', 'work_times_tags.work_time_id')
            ->leftJoin('tags', 'tags.id', '=', 'work_times_tags.tag_id')
            ->where('work_user_id', $userId)
            ->where('start_date_time', '>=', $start)
            ->where(function($q) use ($start, $end, $utcOffset) {
                $q->where('end_date_time', '<=', $end);

                $nowTime = Carbon::now($utcOffset);
                if ($nowTime >= Carbon::parse($start, $utcOffset) && $nowTime <= Carbon::parse($end, $utcOffset)) {
                    $q->orWhereNull('end_date_time');
                }
            })
            ->whereIn('reports_view.work_time_id', $workTimeIds)
            ->get([
                'reports_view.start_date_time',
                'reports_view.end_date_time',
                'reports_view.duration',
                'reports_view.work_id',
                'reports_view.work_name',
                'reports_view.work_user_id',
                'reports_view.work_time_id',
                'reports_view.task_description',
                'reports_view.project_id',
                'reports_view.project_name',
                'reports_view.project_color',
                'tags.id as tag_id',
                'tags.name as tag_name',
                'tags.color as tag_color',
            ]);
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserForCalendarView(int $userId)
    {
        return $this->model->where('id', $userId)->select('id', 'name', 'surname', 'avatar')->first()->only(['id', 'name', 'surname', 'avatar']);
    }

    /**
     * @param object $data
     * @return object
     */
    public function userRegistration(object $data): object
    {
        return $this->model->userRegistration($data);
    }

    /**
     * @param int $userId
     */
    public function getUserById(int $userId)
    {
        return $this->model->where('id', $userId)->first();
    }

    /**
     * @param int $userId
     * @return bool
     */
    public function deleteUser(int $userId): bool
    {
        return $this->model->where('id', $userId)->delete();
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserCasualInformation(int $userId)
    {
        return \DB::table('user_casuals')
            ->where('user_id', $userId)
            ->get([
                'id',
                'user_id',
                'title',
                'value',
            ]);
    }

    /**
     * @param object $request
     * @return bool
     */
    public function createUserCasualInformation(object $request): bool
    {
        $userCasualData = new UserCasual;
        $userCasualData->user_id = $request->id;
        $userCasualData->title = $request->title;
        $userCasualData->value = $request->value;
        if ($userCasualData->save()) {
            return true;
        }
        return false;
    }

    /**
     * @param object $request
     * @return bool
     */
    public function updateUserCasualInformation(object $request): bool
    {
        return \DB::table('user_casuals')->where(['user_id' => $request->id, 'id' => $request->casualId])->update(['title' => $request->title, 'value' => $request->value]);
    }

    /**
     * @param int $userId
     * @param int $casualId
     * @return bool
     */
    public function deleteUserCasualInformation(int $userId, int $casualId): bool
    {
        return \DB::table('user_casuals')->where(['user_id' => $userId, 'id' => $casualId])->delete();
    }

    /**
     * @param object $request
     * @param int $authorId
     * @return mixed
     */
    public function updateOrCreateNotesInformation(object $request, int $authorId, string $eventId = null)
    {
        $nowTime = Carbon::now();
        $uuid = (string)Str::uuid();
        $sharedUserCount = count($request->visibility_user_ids);
        $notesData = [];
        $currentNote = UserNote::select('*')->where('uuid', '=', $request->uuid)->first();
        if ($request->note_type && !empty($request->visibility_user_ids)) { //shared note case
            $arrayVisibilityUserIds = $request->visibility_user_ids;
            if (!in_array($request->id, $arrayVisibilityUserIds)) {
                array_push($arrayVisibilityUserIds, $authorId);
            }
            foreach ($arrayVisibilityUserIds as $userId) {
                $notesData[] = [
                    "user_id" => is_array($userId) ? $userId['id'] : $userId,
                    "uuid" => !isset($request->uuid) ? $uuid : $request->uuid,
                    "author_of_notes" => $authorId,
                    "notes_text" => $request->note,
                    "notes_type" => $request->note_type,
                    "owner_user_id" => $request->id,
                    "shared_users" => $sharedUserCount ? json_encode($arrayVisibilityUserIds) : json_encode([$request->id]),
                    "created_at" => $nowTime,
                    "updated_at" => $nowTime,
                    "reminder" => !$eventId && $request->set_reminder ? $currentNote && $currentNote['reminder'] || false : $request->set_reminder,
                    "reminder_date_time" => !$eventId && $request->set_reminder ? $currentNote && $currentNote['reminder_date_time'] : $request->reminderDate,
                    "google_event_id" => !$eventId && $request->set_reminder ? $currentNote && $currentNote['google_event_id'] : $eventId,
                ];
            }
        } else {   // private note case
            $notesData[] = [
                "user_id" => $request->id,
                "uuid" => !isset($request->uuid) ? $uuid : $request->uuid,
                "author_of_notes" => $authorId,
                "notes_text" => $request->note,
                "notes_type" => $request->note_type,
                "owner_user_id" => $request->id,
                "shared_users" => $sharedUserCount ? json_encode($request->visibility_user_ids) : json_encode([$request->id]),
                "created_at" => $nowTime,
                "updated_at" => $nowTime,
                "reminder" => !$eventId && $request->set_reminder ? $currentNote && $currentNote['reminder'] || false : $request->set_reminder,
                "reminder_date_time" => !$eventId && $request->set_reminder ? $currentNote && $currentNote['reminder_date_time'] : $request->reminderDate,
                "google_event_id" => !$eventId && $request->set_reminder ? $currentNote && $currentNote['google_event_id'] : $eventId,
            ];
        }
        $notes = new UserNote();
        if (!isset($request->formId)) {
            $notes->insert($notesData);
        } else {
            $notes->where(['uuid' => $request->uuid])->delete();
            $notes->insert($notesData);
        }

    }

    /**
     * @param int $authUserId
     * @return array
     */
    public function getNoteForActiveUsers(int $authUserId): array
    {
        return \DB::table('users')->where('status', $this->model::ACTIVE['value'])->where('id',  '<>', $authUserId)->get(['id', 'name', 'surname', 'avatar'])->toArray();
    }

    /**
     * @param int $userId
     * @param array $spouseData
     * @return mixed
     */
    public function createOrUpdateSpouseData(int $userId, array $spouseData)
    {
        return UserRelative::updateOrCreate(
            ['user_id' => $userId, 'type' => $spouseData['type']],
            [
                'full_name' => $spouseData['full_name'],
                'birthplace' => $spouseData['birthplace'],
                'birthday' => $spouseData['birthday'],
                'phone_number' => $spouseData['spousePhoneNumber'],
            ]
        );
    }

    /**
     * @param int $userId
     * @param int $status
     * @return bool
     */
    public function changeUserStatus(int $userId, int $status): bool
    {
        return \DB::table('users')->where('id', '=', $userId)->update(['status' => $status]);
    }

    /**
     * @param array $userIds
     * @return mixed
     */
    public function getUserPositionsByUserIds(array $userIds)
    {
        return \DB::table('user_job_information')
            ->select('user_id', 'position')
            ->whereIn('user_id', $userIds)
            ->get();
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserCountKids(int $userId)
    {
        $userKids = UserRelative::where(['user_id' => $userId, 'type' => 'kid'])->get();
        return $userKids->count();
    }
    /**
     * @param int $id
     * @return mixed
     */
    public function getNote(int $id)
    {
        return UserNote::find($id);
    }
    /**
     * @param string $uuId
     * @return mixed
     */
    public function removeNote(string $uuId)
    {
        return UserNote::where('uuid', $uuId)->delete();
    }

    /**
     * @param int $userId
     * @param string $userEmail
     * @return bool
     */
    public function updateUserEmail(int $userId, string $userEmail): bool
    {
        return $this->model->updateUserEmail($userId, $userEmail);
    }

    /**
     * @param int $userId
     * @param string|null $userProfessionalStory
     * @return mixed
     */
    public function updateUserProfessionalStory(int $userId, string $userProfessionalStory = null)
    {
        return User::where('id', $userId)->update(['professional_story' => $userProfessionalStory]);
    }

    /**
     * @param int $salaryId
     * @param int $userId
     * @return bool
     */
    public function deleteUserSalary(int $salaryId, int $userId): bool
    {
        return UserSalary::where(['id' => $salaryId, 'user_id' => $userId])->delete();
    }

    /**
     * @param int $salaryId
     * @param int $userId
     * @param string $type
     * @return bool
     */
    public function deleteUserBonus(int $salaryId, int $userId, string $type): bool
    {
        return UserBonus::where(['id' => $salaryId, 'user_id' => $userId, 'type' => $type])->delete();
    }

    /**
     * @return object
     */
    public function getQuerySkills(): object
    {
        return \DB::table('skills');
    }

    /**
     * @param array $skillData
     * @return mixed
     */
    public function insertAndGetInsertedSkillIds(array $skillData)
    {
        return Skill::insertGetId($skillData);
    }

    /**
     * @param array $skillIds
     * @return array
     */
    public function getCheckedSkillIds(array $skillIds): array
    {
        return Skill::whereIn('id', $skillIds)->pluck('id')->toArray();
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getExistingSkillsIds(int $userId): array
    {
        return UserSkill::where('user_id', $userId)->pluck('skill_id')->toArray();
    }

    /**
     * @param int $userId
     * @param array $skillsToDelete
     * @return bool
     */
    public function deleteUserSkills(int $userId, array $skillsToDelete): bool
    {
        return UserSkill::where('user_id', $userId)->whereIn('skill_id', $skillsToDelete)->delete();
    }

    /**
     * @param int $userId
     * @param array $skillIds
     * @return mixed
     */
    public function insertUserSkills(int $userId,array $skillIds)
    {
        $data = [];
        $dateTime = Carbon::now();
        foreach ($skillIds as $key=>$value){
            $data[] = [
                'skill_id'=> $value,
                'user_id'=> $userId,
                'date'=> $dateTime,
            ];
        }
        UserSkill::insert($data);
    }

    /**
     * @return object
     */
    public function getQuerySoftSkills(): object
    {
        return \DB::table('soft_skills');
    }

    /**
     * @param array $softSkillData
     * @return mixed
     */
    public function insertAndGetInsertedSoftSkillIds(array $softSkillData)
    {
        return SoftSkill::insertGetId($softSkillData);
    }

    /**
     * @param array $softSkillIds
     * @return array
     */
    public function getCheckedSoftSkillIds(array $softSkillIds): array
    {
        return SoftSkill::whereIn('id', $softSkillIds)->pluck('id')->toArray();
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getExistingSoftSkillsIds(int $userId): array
    {
        return UserSoftSkill::where('user_id', $userId)->pluck('soft_skill_id')->toArray();
    }

    /**
     * @param int $userId
     * @param array $softSkillsToDelete
     * @return bool
     */
    public function deleteUserSoftSkills(int $userId, array $softSkillsToDelete): bool
    {
        return UserSoftSkill::where('user_id', $userId)->whereIn('soft_skill_id', $softSkillsToDelete)->delete();
    }

    /**
     * @param int $userId
     * @param array $softSkillIds
     * @return mixed
     */
    public function insertUserSoftSkills(int $userId, array $softSkillIds)
    {
                $data = [];
                $dateTime = Carbon::now();
                foreach ($softSkillIds as $key=>$value){
                    $data[] = [
                        'soft_skill_id'=> $value,
                        'user_id'=> $userId,
                        'date'=> $dateTime,
                    ];
                }
            UserSoftSkill::insert($data);

    }
}
