<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserFullCalendarRequest;
use App\Http\Requests\UsersContactInfoDeleteRequest;
use App\Http\Requests\UsersContactInfoSocialNetworksStoreRequest;
use App\Http\Requests\UsersAllDataRequest;
use App\Http\Requests\UsersDeleteJobInformationRequest;
use App\Http\Requests\UsersGetDetailRequest;
use App\Http\Requests\UsersCreateVacationRequest;
use App\Http\Requests\UsersCreateWorkHistoryRequest;
use App\Http\Requests\UsersGetSelectedDayNoteRequest;
use App\Http\Requests\UsersListRequest;
use App\Http\Requests\UsersRemoveDocumentRequest;
use App\Http\Requests\UsersRemoveEducationRequest;
use App\Http\Requests\UsersRemunerationAddBonusRequest;
use App\Http\Requests\UsersRemunerationAddSalaryRequest;
use App\Http\Requests\UserRemunerationDeleteBonusesRequest;
use App\Http\Requests\UserDeleteSalaryRequest;
use App\Http\Requests\UsersRemunerationJobTypeStoreRequest;
use App\Http\Requests\UsersRemoveVacationRequest;
use App\Http\Requests\UsersRemunerationUpdateBonusRequest;
use App\Http\Requests\UsersRemunerationUpdateRequest;
use App\Http\Requests\UsersRemunerationUpdateSalaryRequest;
use App\Http\Requests\UsersUpdateCollegeInformationRequest;
use App\Http\Requests\UsersUpdateJobInformationRequest;
use App\Http\Requests\UsersUpdateLanguageInformationRequest;
use App\Http\Requests\UsersUpdateMilitaryInformationRequest;
use App\Http\Requests\UsersUpdateSchoolInformationRequest;
use App\Http\Requests\UpdateUserUniversityInformationRequest;
use App\Http\Requests\UsersContactInfoUpdateWorkNumberAndEmailRequest;
use App\Http\Requests\UsersUpdateVacationRequest;
use App\Http\Requests\UsersWebSiteStoreRequest;
use App\Http\Requests\UsersUpdateUserDocumentRequest;
use App\Http\Requests\UserCasualInfoRequest;
use App\Http\Requests\RemoveUserCasualRequest;
use App\Http\Requests\UserCasualInfoListRequest;
use App\Http\Requests\UpdateUserEmailRequest;
use App\Models\Role;
use App\Models\Skill;
use App\Models\SoftSkill;
use App\Models\User;
use App\Models\UserBonus;
use App\Models\UserContact;
use App\Models\UserDocument;
use App\Models\UserJobInformation;
use App\Models\UserEducation;
use App\Models\UserLanguage;
use App\Models\UserRelative;
use App\Models\UserNote;
use App\Models\UserSalary;
use App\Models\UserSkill;
use App\Models\UserSoftSkill;
use App\Models\UserVacation;
use App\Models\UserWorkHistory;
use App\Services\Interfaces\TodoServiceInterface;
use App\Services\Interfaces\UserJobInformationServiceInterface;
use App\Services\Interfaces\UserVacationServiceInterface;
use App\Services\Interfaces\UserWorkHistoryServiceInterface;
use App\Services\Interfaces\UserLanguageServiceInterface;
use App\Traits\File;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\NoteAddUpdateRequest;
use App\Http\Requests\NoteRemoveRequest;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\Interfaces\RoleServiceInterface;
use App\Services\Interfaces\UserEducationServiceInterface;
use Spatie\Period\Boundaries;
use Spatie\Period\Period;
use Spatie\Period\Precision;


class UsersController extends Controller
{
    use File;

    /**
     * @var UserServiceInterface
     */
    private $userService;

    /**
     * @var RoleServiceInterface
     */
    private $roleService;

    /**
     * @var UserWorkHistoryServiceInterface
     */
    private $userWorkHistoryService;

    /**
     * @var UserVacationServiceInterface
     */
    private $userVacationService;

    /**
     * @var UserEducationServiceInterface
     */
    private $userEducationService;

    /**
     * @var UserLanguageServiceInterface
     */
    private $userLanguageService;

    /**
     * @var TodoServiceInterface
     */
    private $todoService;

    /**
     * @var UserJobInformationServiceInterface
     */
    private $userJobInformationService;

    /**
     * UsersController constructor.
     * @param UserServiceInterface $userService
     * @param RoleServiceInterface $roleService
     * @param UserWorkHistoryServiceInterface $userWorkHistoryService
     * @param UserVacationServiceInterface $userVacationService
     * @param UserEducationServiceInterface $userEducationService
     * @param UserLanguageServiceInterface $userLanguageService
     * @param TodoServiceInterface $todoService
     * @param UserJobInformationServiceInterface $userJobInformationService
     */
    public function __construct(
        UserServiceInterface $userService,
        RoleServiceInterface $roleService,
        UserWorkHistoryServiceInterface $userWorkHistoryService,
        UserVacationServiceInterface $userVacationService,
        UserEducationServiceInterface $userEducationService,
        UserLanguageServiceInterface $userLanguageService,
        TodoServiceInterface $todoService,
        UserJobInformationServiceInterface $userJobInformationService
    )
    {
        $this->userService = $userService;
        $this->roleService = $roleService;
        $this->userWorkHistoryService = $userWorkHistoryService;
        $this->userVacationService = $userVacationService;
        $this->userEducationService = $userEducationService;
        $this->userLanguageService = $userLanguageService;
        $this->todoService = $todoService;
        $this->userJobInformationService = $userJobInformationService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index()
    {
        $user = null;
        $loggedUser = auth()->user();
        if (!empty($loggedUser)) {
            $user = $this->userService->findByIdWithRolesAndPermissions($loggedUser->id);
            if (!empty($user)) {
                $user->team_members_role_permissions = $user->teamMembersRolePermissions();
                $user->user_projects_role_permissions = $user->userProjectsRolePermissions();
            }
        }
        return response()->json(['status' => true, 'message' => __('Getting user info'), 'user' => $user]);
    }

    /**
     * Display a listing of the resource.
     * @param UsersListRequest $request
     * @return JsonResponse
     */
    public function list(UsersListRequest $request): JsonResponse
    {
        $users = [];
        $loggedUser = $request->user();
        $showAllRoles = $request->showAllRoles ?? false;
        if ($loggedUser->can('view users')) {
            $allRoleIds = [];
            if (!empty($request->roles)) {
                $roleNames = !is_array($request->roles) ? [$request->roles] : $request->roles;
                $allRoleIds = $this->roleService->roleIdsByNames($roleNames);
            }
            $users = $this->userService->list($request, $allRoleIds, $showAllRoles);
        }

        return response()->json(['status' => true, 'message' => __('getting_users'), 'users' => $users]);
    }

    /**
     * Display a listing of the resource.
     * @param Request $request
     * @return JsonResponse
     */
    public function userRoles(Request $request): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => __('getting_user_roles'),
            'roles' => $this->roleService->userRoles($request->user()),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function teamIds(Request $request)
    {
        // TODO should we add permission check?
        $teamMemberIds = $request->user()->getTeamMemberIds();
        return response()->json(['status' => true, 'message' => __('getting_user_teamIds'), 'teamIds' => $teamMemberIds]);  // TODO incorrect 'teamIds' => $teamMemberIds
    }

    /**
     * Display a listing of the resource.
     * @return JsonResponse
     */
    public function userPositions()
    {
        // TODO should we add permission check?
        return response()->json(['status' => true, 'message' => __('getting_user_positions'), 'positions' => UserJobInformation::whereNotNull('position')->distinct('position')->pluck('position')]);
    }

    public function userSkills(): JsonResponse
    {
        // TODO should we add permission check?
        return response()->json(['status' => true, 'message' => __('getting_user_skills'), 'skills' => $this->userService->getQuerySkills()->get(['id', 'name'])]);
    }

    public function userSoftSkills(): JsonResponse
    {
        // TODO should we add permission check?
        return response()->json(['status' => true, 'message' => __('getting_user_soft_skills'), 'softSkills' => $this->userService->getQuerySoftSkills()->get(['id', 'name'])]);
    }

    /**
     * Get Selected Day Note.
     *
     * @param UsersGetSelectedDayNoteRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function getSelectedDayNote(UsersGetSelectedDayNoteRequest $request, int $id)
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $id;
        if (!$this->isValidUserId($id)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        if ($loggedUser->can('view', UserWorkHistory::class) ||
            ($loggedUser->can('viewSelfDayNote', UserWorkHistory::class) && $isOwnerPage)) {
            $workedDaysAnalysis = $this->userWorkHistoryService->getWorkedDaysAnalysis($id, $request->date);
            $SelectedDayNote = $this->userWorkHistoryService->getWorkHistoryInfo($id, $request->date);

            return response()->json(
                [
                    'status' => true,
                    'message' => __('getting_selected_day_note'),
                    'data' => $SelectedDayNote,
                    'workedDaysAnalysis' => $workedDaysAnalysis
                ]
            );
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get Selected Month Notes.
     *
     * @param UsersGetSelectedDayNoteRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function getSelectedMonthNotes(UsersGetSelectedDayNoteRequest $request, int $id)
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $id;
        if (!$this->isValidUserId($id)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        if ($loggedUser->can('view', UserWorkHistory::class) ||
            ($loggedUser->can('viewSelfDayNote', UserWorkHistory::class) && $isOwnerPage)) {
            $workedDaysAnalysis = $this->userWorkHistoryService->getWorkedDaysAnalysis($id, $request->date);
            $SelectedMonthNotes = $this->userWorkHistoryService->getWorkHistoryInfoForSelectedMonth($id, $request->date);

            return response()->json(
                [
                    'status' => true,
                    'message' => __('getting_selected_day_note'),
                    'data' => $SelectedMonthNotes,
                    'workedDaysAnalysis' => $workedDaysAnalysis
                ]
            );
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request)
    {
        $data = json_decode($request->input('data'));
        $documents = $request->file('documents');
        $loggedUser = auth()->user();
        if ($loggedUser->can('add users')) {
            //filtering request
            $requestCollection = collect($data);
            $filteredRequestData = $requestCollection->filter(function ($value) {
                return $value !== 0 ? !!$value : true;
            });
            $requestData = $filteredRequestData->all();

            if ($request->hasFile('documents')) {
                $requestData['documents'] = $documents;
            }

            $validatedData = Validator::make($requestData, [
                'name' => 'required|max:70|regex:/^[a-zA-Z\s]*$/',
                'email' => 'required|email|unique:users,email',
                'surname' => 'string|max:191',
                'patronymic' => 'string|max:191',
                'position' => 'string|max:191',
                'notes' => 'string',
                'birthday' => 'date',
                'role' => 'required|string',
                'status' => 'nullable|integer',
                'type' => 'nullable|integer',
                'documents.*' => 'file|mimes:jpg,jpeg,png,txt,docx,doc,xlsx,pdf|max:'.env('MAX_FILE_UPLOAD_SIZE', 10240),
                'contacts.*' => 'string'
            ]);
            if ($validatedData->fails()) {
                return response()->json(['status' => false, 'message' => $validatedData->errors()]);
            }
            $allRoles = Role::all()->pluck('name')->toArray();
            $userRole = $requestData['role'];

            if (!in_array($userRole, $allRoles)) {
                return response()->json(['status' => false, 'message' => __('invalid_user_role'), 'user' => null]);
            }

            $skillsToAdd = [];
            if (isset($requestData['skills'])) {
                foreach ($requestData['skills'] as $skill) {
                    $skillsToAdd[] = Skill::firstOrCreate(['name' => $skill]);
                }
            }

            $user = new User();
            $user->fill([
                "name" => $requestData['name'],
                "email" => $requestData['email'],
                "surname" => isset($requestData['surname']) ? $requestData['surname'] : null,
                "patronymic" => isset($requestData['patronymic']) ? $requestData['patronymic'] : null,
                "position" => isset($requestData['position']) ? $requestData['position'] : null,
                "notes" => isset($requestData['notes']) ? $requestData['notes'] : null,
                "birthday" => isset($requestData['birthday']) ? $requestData['birthday'] : null,
                "password" => bcrypt(env('USER_DEFAULT_PASSWORD', 'password')),
            ]);
            if ($user->save()) {
                $user->syncRoles($userRole);
                if (isset($requestData['skills'])) {
                    if (count($skillsToAdd) > 0) {
                        foreach ($skillsToAdd as $skill) {
                            $userSkill = new UserSkill();
                            $userSkill->fill([
                                "skill_id" => $skill->id,
                                "user_id" => $user->id,
                                "date" => Carbon::parse(Carbon::now())->format('Y-m-d')
                            ]);
                            $userSkill->save();
                        }
                    }
                }

                if ($request->hasFile('documents')) {
                    //User document functionality
                    if ($loggedUser->can('createSelfDocuments', new UserDocument()) ||
                        $loggedUser->can('create', new UserDocument())) {
                        //upload user documents
                        if (is_array($documents)) {
                            $this->setDirectory('public/documents/' . $user->id); // set directory for uploading document
                            foreach ($documents as $type => $document) {
                                $uploadResult = $this->upload($document);
                                if ($uploadResult['success']) {
                                    UserDocument::updateOrCreate(
                                        ['user_id' => $user->id, 'type' => $type],
                                        ['uploader_id' => $loggedUser->id, 'file' => $uploadResult['name']]);
                                }
                            }
                        }
                    }
                }

                if (isset($requestData['contacts'])) {
                    if ($loggedUser->can('createSelfContacts', new UserContact()) ||
                        $loggedUser->can('create', new UserContact())) {
                        foreach ($requestData['contacts'] as $contactName => $contactVale) {
                            $contactType = $contactName === 'workedNumber' ? 'mobile' : 'address';
                            $userContact = new UserContact();
                            $userContact->fill([
                                'user_id' => $user->id,
                                'type' => $contactType,
                                'name' => $contactName,
                                'value' => $contactVale
                            ]);
                            $userContact->save();
                        }
                    }
                }
            }
            return response()->json(['status' => true, 'message' => __('the_user_added_successfully'), 'user' => $user]);
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'user' => null]);
    }

    /**
     * Display the specified resource.
     *
     * @param int $userId
     * @return Response
     */
    public function show($userId)
    {
        // TODO should we add permission check?
        return User::where('id', $userId)
            ->with('roles')
            ->with('permissions')
            ->with('skills')
            ->with('documents')
            ->with('contacts')
            ->with(['userJobInformation' => function ($q) {
                $q->orderBy('work_contract', 'DESC');
            }])
            ->with('educations')
            ->with('languages')
            ->with('UserRelative')
            ->with('UserNote')
            ->with('softSkills')
            ->first();
    }

    /**
     * Get user details page header data.
     * @param $userId
     * @return JsonResponse
     */
    public function getUserDetailsHeaderInfo($userId): JsonResponse
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }
        if (!($loggedUser->can('view user details') || ($isOwnerPage && $loggedUser->can('view self details')))){
            return response()->json(['status' => false, 'message' => __('Access Denied'),'data' => null]);
        }

        $userDetailHeaderData = $this->getUserDetailHeaderData($userId);

        if ($userDetailHeaderData) {
            return response()->json(['status' => true, 'message' => __('getting_user_details_header_data'), 'data' => $userDetailHeaderData]);
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get the Personal Information resource.
     *
     * @param UsersGetDetailRequest $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getPersonalInformation(UsersGetDetailRequest $request, int $userId): JsonResponse
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }
        if (!($loggedUser->can('view user details') || ($isOwnerPage && $loggedUser->can('view self details')))){
            return response()->json(['status' => false, 'message' => __('Access Denied'),'data' => null]);
        }

        $userPersonalInfo = $this->getUserPersonalInfoData($userId);
        $userPersonalInfo->amountOfKids = $this->userService->getUserCountKids($userId);

        if ($userPersonalInfo) {
            return response()->json(['status' => true, 'message' => __('getting_user_personal_information'), 'data' => $userPersonalInfo]);
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get the Job Information resource.
     *
     * @param UsersGetDetailRequest $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getJobInformation(UsersGetDetailRequest $request, int $userId)
    {
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;

        if (($loggedUser->can('viewSelfJobInformation', new UserJobInformation()) && $isOwnerPage) ||
            $loggedUser->can('view', new UserJobInformation())) {
            $userJobInfo = $this->getUserJobInfoData($userId);

            if ($userJobInfo) {
                return response()->json(['status' => true, 'message' => __('getting_user_job_information'), 'data' => $userJobInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }


    /**
     * Get the Contact Information resource.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\Response
     */
    public function getContactInformation(Request $request, $userId)
    {
        if (!$this->isValidRequestData($request, ['tab' => 'string|nullable'])) {
            return response()->json(['status' => false, 'message' => __('invalid_data')]);
        }

        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        $userContactInfo = $this->getUserContactInformation($userId);

        if ($userContactInfo) {
            return response()->json(['status' => true, 'message' => __('getting_user_contact_information'), 'data' => $userContactInfo]);
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * @param UsersGetDetailRequest $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getEducationInformation(UsersGetDetailRequest $request, int $userId)
    {
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        $userEduInfo = $this->userService->getUserEducationInfoData($userId);

        if ($userEduInfo) {
            return response()->json(['status' => true, 'message' => __('getting_user_job_information'), 'data' => $userEduInfo]);
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }
    public function getNotesInformation(Request $request, $userId): JsonResponse
    {
        if (!$this->isValidRequestData($request, ['tab' => 'string|nullable'])) {
            return response()->json(['status' => false, 'message' => __('invalid_data')]);
        }

        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        $userNoteInfo = $this->getUserNotesInfoData($userId);
        if ($userNoteInfo) {
            return response()->json(['status' => true, 'message' => __('getting_user_notes_information'),
                'data' => $userNoteInfo]);
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get the Remuneration resource.
     *
     * @param UsersGetDetailRequest $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getRemuneration(UsersGetDetailRequest $request, int $userId)
    {
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        $userRemuneration = $this->getUserRemuneration($userId);

        if ($userRemuneration) {
            return response()->json([
                'status' => true,
                'message' => __('getting_user_remuneration'),
                'data' => [
                    'userRemuneration' => $userRemuneration,
                    'jobTypes' => $this->userService->getUserJobTypes(),
                    'levels' => $this->userService->getUserLevels(),
                ]
            ]);
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get the User Documents resource.
     *
     * @param UsersGetDetailRequest $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getUserDocuments(UsersGetDetailRequest $request, int $userId)
    {
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;

        if (($loggedUser->can('viewSelfDocuments', new UserDocument()) && $isOwnerPage) ||
            $loggedUser->can('view', new UserDocument())) {

            $userDocuments = $this->getUserDocumentsData($userId);

            if ($userDocuments) {
                return response()->json(['status' => true, 'message' => __('getting_user_documents'), 'data' => $userDocuments]);
            }
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get the User Documents resource.
     *
     * @param UsersGetDetailRequest $request
     * @param int $userId
     * @return JsonResponse
     */
    public function getMoreInfo(UsersGetDetailRequest $request, int $userId)
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        if ($loggedUser->can('view more info') || ($loggedUser->can('view self more info') && $isOwnerPage)) {
            $moreInfo = $this->getMoreInfoData($userId);

            if ($moreInfo) {
                return response()->json(['status' => true, 'message' => __('getting_user_more_info'), 'data' => $moreInfo]);
            }
        }

        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Get More info.
     * @param int $userId
     * @return mixed
     */
    private function getMoreInfoData(int $userId)
    {
        return [
            'workedDaysAnalysis' => $this->userWorkHistoryService->getWorkedDaysAnalysis($userId),
            'dayNote' => $this->userWorkHistoryService->getWorkHistoryInfo($userId),
            'selectedMonthNotes' => $this->userWorkHistoryService->getWorkHistoryInfoForSelectedMonth($userId),
            'vacations' => $this->userVacationService->getVacationsData($userId),
            'id' => $userId
        ];
    }

    /**
     * Get user personal info detail.
     * @param int $userId
     * @return mixed
     */
    private function getUserDetailHeaderData(int $userId)
    {
        $headerInfoSelectFields = [
            'id',
            'name',
            'surname',
            'patronymic',
            'email',
            'birthplace',
            'about',
            'type',
            'avatar',
            'birthday',
            'nickname',
            'tin',
            'email_verified_at',
        ];
        return $this->getUserDetailQuery($userId, $headerInfoSelectFields)
            ->with(['userJobInformation' => function ($q) {
                $q->select('work_contract', 'user_id');
                $q->orderBy('work_contract', 'DESC');
                $q->limit(1);
            }])
            ->with('contacts')
            ->with(['skills' => function($q) {
                $q->select('name');
            }])
            ->first();
    }

    /**
     * Get user personal info detail.
     * @param int $userId
     * @return mixed
     */
    private function getUserPersonalInfoData($userId)
    {
        $personalInfoSelectFields = [
            'id',
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
            'amountOfKids',
            'nickname',
            'tin',
            'email_verified_at',
        ];
        return $this->getUserDetailQuery($userId, $personalInfoSelectFields)
            ->with('UserRelative')
            ->with('contacts')
            ->first();
    }

    /**
     * Get user job info detail.
     * @param int $userId
     * @return mixed
     */
    private function getUserJobInfoData(int $userId)
    {
        $jobInfoSelectFields = [
            'id',
            'status',
            'name',
            'type',
            'surname',
            'patronymic',
            'email',
            'birthday',
            'gender',
            'nationality',
            'about',
            'time_offset',
            'family_status',
            'amountOfKids',
            'professional_story',
        ];
        return $this->getUserDetailQuery($userId, $jobInfoSelectFields)
            ->with(['userJobInformation' => function ($q) {
                $q->orderBy('work_contract', 'DESC');
            }])
            ->with('softSkills')
            ->with('skills')
            ->with('contacts')
            ->first();
    }

    /**
     * Get user Contact info detail.
     * @param int $userId
     * @return mixed
     */
    private function getUserContactInformation($userId)
    {
        $contactInfoSelectFields = [
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
        return $this->getUserDetailQuery($userId, $contactInfoSelectFields)
            ->with('contacts')
            ->first();
    }

    /**
     * Get user job info detail.
     * @param int $userId
     * @return mixed
     */
    private function getUserRemuneration(int $userId)
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === $userId;
        $remunerationFields = [
            'id',
            'status',
            'name',
            'type',
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
        $remuneration = $this->getUserDetailQuery($userId, $remunerationFields);

        if (($loggedUser->can('view remuneration')) || ($loggedUser->can('view self remuneration') && $isOwnerPage)) {
            $remuneration->with('bonuses')->with('UserSalary');
        }

        return $remuneration->first()->setAppends([]);
    }

    private function getUserNotesInfoData($userId)
    {
        $notesInfoSelectFields = [
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
        return $this->getUserDetailQuery($userId, $notesInfoSelectFields)->with('UserNote')->first();
    }

    /**
     * Get user files.
     * @param int $userId
     * @return mixed
     */
    private function getUserDocumentsData(int $userId)
    {
        $filesSelectFields = [
            'id',
            'status',
            'name',
            'type',
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
        return $this->getUserDetailQuery($userId, $filesSelectFields)
            ->with('documents')
            ->first();
    }

    /**
     * Get user query builder.
     * @param int $userId
     * @param array $currentPageSelectFields
     * @return mixed
     */
    private function getUserDetailQuery(int $userId, array $currentPageSelectFields)
    {
        return User::select($currentPageSelectFields)->where('id', $userId);
    }

    /**
     * checking user id.
     *
     * @param int $userId
     * @return boolean
     */
    private function isValidUserId(int $userId)
    {
        return (bool) User::find($userId);
    }

    /**
     * request validation.
     *
     * @param $request
     * @param $condition
     * @return boolean
     */
    private function isValidRequestData($request, $condition=[]) //todo it'll be removed after integration requests for each actions
    {
        return !Validator::make($request->all(), $condition)->fails();
    }

    /**
     * Update User Vacation.
     *
     * @param UsersUpdateVacationRequest $request
     * @return JsonResponse
     */
    public function updateVacation(UsersUpdateVacationRequest $request)
    {
        $loggedUser = auth()->user();
        $userVacation = $this->userVacationService->getVacationByIdAndUserId($request->id, $request->user_id);
        if ($userVacation) {
            if ($loggedUser->can('update', $userVacation) || $loggedUser->can('updateSelfVacation', $userVacation)) {
                if ($this->userVacationService->updateVacation($request, $userVacation->id)) {
                    $vacations = $this->userVacationService->getVacationsData($request->user_id);
                    if ($vacations) {
                        return response()->json(['status' => true, 'message' => __('The User Vacation Updated Successfully'), 'data' => $vacations]);
                    }
                }
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Delete User Vacation.
     *
     * @param UsersRemoveVacationRequest $request
     * @return JsonResponse
     */
    public function removeVacation(UsersRemoveVacationRequest $request)
    {
        $loggedUser = auth()->user();
        $userVacation = $this->userVacationService->getVacationByIdAndUserId($request->id, $request->user_id);
        if ($loggedUser->can('delete', $userVacation) || $loggedUser->can('deleteSelfVacation', $userVacation)) {
            if ($this->userVacationService->delete($userVacation->id)) {
                $vacations = $this->userVacationService->getVacationsData($request->user_id);

                if ($vacations) {
                    return response()->json(['status' => true, 'message' => __('The User Vacation Deleted Successfully'), 'data' => $vacations]);
                }
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Create User Vacation.
     *
     * @param UsersCreateVacationRequest $request
     * @return JsonResponse
     */
    public function createVacation(UsersCreateVacationRequest $request)
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $request->user_id;

        if ($loggedUser->can('create', new UserVacation()) ||
            ($loggedUser->can('createSelfVacation', new UserVacation()) && $isOwnerPage)) {

            $createdData = $this->userVacationService->createVacation($request);
            if ($createdData) {
                $vacations = $this->userVacationService->getVacationsData($createdData->user_id);

                if ($vacations) {
                    return response()->json(['status' => true, 'message' => __('The User Vacation Created Successfully'), 'data' => $vacations]);
                }
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Create Work History.
     *
     * @param UsersCreateWorkHistoryRequest $request
     * @return JsonResponse
     */
    public function createWorkHistory(UsersCreateWorkHistoryRequest $request)
    {
        $loggedUser = auth()->user();
        $isOwnerPage = (int) $loggedUser->id === (int) $request->user_id;

        if ($loggedUser->can('create', UserWorkHistory::class) ||
            ($loggedUser->can('createSelfDayNote', UserWorkHistory::class) && $isOwnerPage)) {

            $createdData = $this->userWorkHistoryService->createWorkDayNote($request);
            if ($createdData) {
                $dayNote = $this->userWorkHistoryService->getWorkHistoryInfo($createdData->user_id, $createdData->date);
                $workedDaysAnalysis = $this->userWorkHistoryService->getWorkedDaysAnalysis($createdData->user_id);
                if ($dayNote) {
                    return response()->json(
                        [
                            'status' => true,
                            'message' => __('The User Work History Created Successfully'),
                            'data' => $dayNote,
                            'workedDaysAnalysis' => $workedDaysAnalysis
                        ]
                    );
                }
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request)
    {
        $data = json_decode($request->input('data'));
        $documents = $request->file('documents');
        $userId = $request->input('id');
        $loggedUser = auth()->user();
        if ($loggedUser->can('edit users')) {
            $user = User::find($userId);
            if (empty($user)) {
                return response()->json(['status' => false, 'message' => __('invalid_user'), 'user' => null]);
            }

            //filtering request
            $requestCollection = collect($data);
            $filteredRequestData = $requestCollection->filter(function ($value) {
                return $value !== 0 ? !!$value : true;
            });
            $requestData = $filteredRequestData->all();
            $checkEmailUnique = trim($user->email) != trim($requestData['email']) ? '|unique:users,email' : '';

            if ($request->hasFile('documents')) {
                $requestData['documents'] = $documents;
            }

            $validatedData = Validator::make($requestData, [
                'name' => 'required|max:70',
                'email' => 'required|email' . $checkEmailUnique,
                'surname' => 'string|max:191',
                'patronymic' => 'string|max:191',
                'position' => 'string|max:191',
                'notes' => 'string',
                'birthday' => 'date',
                'role' => 'required|string',
                'status' => 'required|integer',
                'type' => 'required|integer',
                'documents.*' => 'file|mimes:jpg,jpeg,png,txt,docx,doc,xlsx,pdf|max:'.env('MAX_FILE_UPLOAD_SIZE', 10240),
                'contacts.*' => 'string'
            ]);
            if ($validatedData->fails()) {
                return response()->json(['status' => false, 'message' => $validatedData->errors()]);
            }
            $allRoles = Role::all()->pluck('name')->toArray();
            $userRole = $requestData['role'];

            if (!in_array($userRole, $allRoles)) {
                return response()->json(['status' => false, 'message' => __('invalid_user_role'), 'user' => null]);
            }

            //user skills functionality
            $existingSkillsIds = UserSkill::where('user_id', $userId)->pluck('skill_id')->toArray();
            if (isset($requestData['skills'])) {
                foreach ($requestData['skills'] as $skill) {
                    Skill::firstOrCreate(['name' => $skill]);
                }

                $checkedSkillIds = Skill::whereIn('name', $requestData['skills'])->pluck('id')->toArray();
                $skillsToSave = array_diff($checkedSkillIds, $existingSkillsIds);
                $skillsToDelete = array_diff($existingSkillsIds, $checkedSkillIds);
                if (count($skillsToSave) > 0) {
                    foreach ($skillsToSave as $skillId) {
                        $userSkill = new UserSkill();
                        $userSkill->fill([
                            "skill_id" => $skillId,
                            "user_id" => $userId,
                            "date" => Carbon::parse(Carbon::now())->format('Y-m-d')
                        ]);
                        $userSkill->save();
                    }
                }
                if (count($skillsToDelete) > 0) {
                    UserSkill::where('user_id', $userId)->whereIn('skill_id', $skillsToDelete)->delete();
                }
            } else {// if request skills doesn't exist but user has skills in db, we'll delete all the user skills
                if (count($existingSkillsIds) > 0) {
                    UserSkill::where('user_id', $userId)->delete();
                }
            }

            //get user document object from db
            $userDocumentObject = UserDocument::where(['user_id' => $userId])->first();
            //if the user has no documents, we check only the create documents permission
            $checkDocumentsPermissions = (
                $loggedUser->can('createSelfDocuments', new UserDocument()) ||
                $loggedUser->can('create', new UserDocument())
            );
            //if the user has documents, we check all the documents permissions
            // Todo: checking permissions will be separate for each permission
            if ($userDocumentObject) {
                $checkDocumentsPermissions = (
                    ($loggedUser->can('createSelfDocuments', new UserDocument()) &&
                        $loggedUser->can('updateSelfDocuments', $userDocumentObject) &&
                        $loggedUser->can('deleteSelfDocuments', $userDocumentObject)) ||
                    ($loggedUser->can('create', new UserDocument()) &&
                        $loggedUser->can('update', $userDocumentObject) &&
                        $loggedUser->can('delete', $userDocumentObject))
                );
            }

            if ($checkDocumentsPermissions) {
                // Update/upload user documents
                if ($request->hasFile('documents')) {
                    if (is_array($documents)) {
                        $userDocuments = $user->documents; // get user documents
                        $this->setDirectory('public/documents/' . $userId); // set directory for uploading document
                        foreach ($documents as $type => $document) {
                            if (is_object($userDocuments)) {
                                foreach ($userDocuments as $userDocument) {
                                    $userDocument = $userDocument->toArray();
                                    // if new document type already exist, we'll delete old document and save new
                                    if ($userDocument['type'] === $type) {
                                        $this->delete($this->getDirectory() . '/' . $userDocument['file']);
                                    }
                                }
                            }
                            $uploadResult = $this->upload($document);
                            if ($uploadResult['success']) {
                                UserDocument::updateOrCreate(
                                    ['user_id' => $userId, 'type' => $type],
                                    ['uploader_id' => $loggedUser->id, 'file' => $uploadResult['name']]);
                            }
                        }
                    }
                }
            }

            //get user contact object from db
            $userContactObject = UserContact::where(['user_id' => $userId])->first();
            //if the user has no contacts, we check only the create contacts permission
            $checkContactsPermissions = (
                $loggedUser->can('createSelfContacts', new UserContact()) ||
                $loggedUser->can('create', new UserContact())
            );
            //if the user has contacts, we check all the contacts permissions
            // Todo: checking permissions will be separate for each permission
            if ($userContactObject) {
                $checkContactsPermissions = (
                    ($loggedUser->can('createSelfContacts', new UserContact()) &&
                        $loggedUser->can('updateSelfContacts', $userContactObject) &&
                        $loggedUser->can('deleteSelfContacts', $userContactObject)) ||
                    ($loggedUser->can('create', new UserContact()) &&
                        $loggedUser->can('update', $userContactObject) &&
                        $loggedUser->can('delete', $userContactObject))
                );
            }

            if ($checkContactsPermissions) {
                // if contacts exist
                if ($requestData['contacts']) {
                    foreach ($requestData['contacts'] as $contactName => $contactVale) {
                        $contactType = $contactName === 'Phone' ? 'phone' : 'social';
                        UserContact::updateOrCreate(
                            ['user_id' => $userId, 'name' => $contactName],
                            ['type' => $contactType, 'value' => $contactVale]);
                    }
                }
            }

            $fillData = [
                "name" => $requestData['name'],
                "email" => $requestData['email'],
                "status" => $requestData['status'],
                "type" => $requestData['type'],
                "surname" => isset($requestData['surname']) ? $requestData['surname'] : null,
                "patronymic" => isset($requestData['patronymic']) ? $requestData['patronymic'] : null,
                "position" => isset($requestData['position']) ? $requestData['position'] : null,
                "notes" => isset($requestData['notes']) ? $requestData['notes'] : null,
                "birthday" => isset($requestData['birthday']) ? $requestData['birthday'] : null
            ];

            $user->fill($fillData);

            if ($user->save()) {
                $user->syncRoles($userRole);
            }
            return response()->json(['status' => true, 'message' => __('the_user_edited_successfully'), 'user' => $user]);
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'user' => null]);
    }

    /**
     * @param $contact
     * @param $userId
     * @param $loggedUser
     * @param $isOwnerPage
     */
    private function createOrUpdateUserContact($contact, $userId,$loggedUser,$isOwnerPage)
    {
        $userContact = UserContact::where(["user_id" => $userId, "type" => $contact["type"], "name" => $contact["name"]])->first();
        if (empty($userContact)) {
            //we check if the user has the privilege to create User Contact
            $checkContactsPermissions = (
                ($loggedUser->can('createSelfContacts', new UserContact()) && $isOwnerPage) ||
                $loggedUser->can('create', new UserContact())
            );

            if ($checkContactsPermissions) {
                UserContact::create([
                    'value' => $contact['value'],
                    'type' => $contact['type'],
                    'name' => $contact['name'],
                    'user_id' => $userId
                ]);
            }
        } else {
            //we check if the user has the privilege to create or update User Contacts
            $checkContactsPermissions = (
                ($loggedUser->can('updateSelfContacts', $userContact) && $isOwnerPage) ||
                $loggedUser->can('update', $userContact)
            );

            if ($checkContactsPermissions) {
                $userContact->update([
                    'value' => $contact['value'],
                ]);
            }
        }
    }

    /**
     * @param $relatives
     * @param $oldOrNewData
     * @param $checkEmailUnique
     * @param $type
     * @return \Illuminate\Contracts\Validation\Validator
     */
    private function validateFamilyData($relatives, $oldOrNewData, $checkEmailUnique, $type): \Illuminate\Contracts\Validation\Validator
    {
        $check = [
            'full_name' => 'nullable|string|max:70',
        ];

        if ($type !== "kid") {
            $check['email'] = $checkEmailUnique;

            if ($oldOrNewData) {
                $check['type'] = 'required|string|max:70';
            }
        } else {
            $check['birthday'] = "nullable|date";
            $check['gender'] = 'required|integer';
        }

        return Validator::make($relatives, $check);
    }

    /**
     * @param $relative
     * @param $type
     * @param $userId
     * @param $loggedUser
     * @param $isOwnerPage
     * @throws \Exception
     */
    private function updateOrCreateUserRelatives($relative, $type, $userId, $loggedUser,$isOwnerPage)
    {
        foreach ($relative as $id => $item) {
            $explodeId = explode("_", $id);
            if (count($explodeId) > 1 && $explodeId[1] === "new") {
                //we check if the user has the privilege to create User Relatives
                $checkRelativePermissions = (
                    ($loggedUser->can('createSelfRelative', new UserRelative()) && $isOwnerPage) ||
                    $loggedUser->can('create', new UserRelative())
                );
                if ($checkRelativePermissions) {
                    if ($type !== "kid") {
                        $newRelative = [
                            "user_id" => $userId,
                            "type" => $type,
                            "full_name" => $item['name'],
                            "phone_number" => $item['phone']
                        ];

                        $validate = $this->validateFamilyData($newRelative, true, "", $type);

                        if ($validate->fails()) {
                            throw new \Exception(implode(', ', $validate->messages()->all()));
                        }

                        UserRelative::create($newRelative);
                    } else {
                        $newKid = [
                            "user_id" => $userId,
                            "type" => $type,
                            "full_name" => $item['name'],
                            "birthday" => (bool)strtotime($item['birthday']) ? Carbon::parse($item['birthday']) : null,
                            "gender" => $item['gender'],
                        ];
                        $validate = $this->validateFamilyData($newKid, true, '', $type);

                        if ($validate->fails()) {
                            throw new \Exception(implode(', ', $validate->messages()->all()));
                        }

                        UserRelative::create($newKid);
                    }
                }
            } else {
                $userRelatives = UserRelative::where("id", $id)->first();
                if (!empty($userRelatives)) {
                    //we check if the user has the privilege to create or update User Relatives
                    $checkRelativePermissions = (
                        $loggedUser->can('updateSelfRelative', $userRelatives) ||
                        ($loggedUser->can('update', $userRelatives))
                    );

                    if ($checkRelativePermissions) {
                        if ($type !== "kid") {
                            $updateRelative = [
                                "full_name" => $item['name'],
                                "phone_number" => $item['phone'],
                            ];

                            $validate = $this->validateFamilyData($updateRelative, false, "", $type);

                            if ($validate->fails()) {
                                throw new \Exception(implode(', ', $validate->messages()->all()));
                            }

                            $userRelatives->update($updateRelative);
                        } else {
                            $updateKid = [
                                "full_name" => $item['name'],
                                "birthday" => (bool)strtotime($item['birthday']) ? Carbon::parse($item['birthday']) : null,
                                "gender" => $item['gender'],
                            ];
                            $validate = $this->validateFamilyData($updateKid, false, "", $type);

                            if ($validate->fails()) {
                                throw new \Exception(implode(', ', $validate->messages()->all()));
                            }

                            $userRelatives->update($updateKid);
                        }
                    }
                }
            }
        }
    }

    /**
     * @param $data
     * @return \Google_Service_Calendar_Event|JsonResponse
     */
    private function addNoteAsGoogleEvent($data)
    {
        $item = $this->userService->addGoogleEvent($data);
        if (!$item) {
            return response()->json(['status' => false, 'message' => __('Cannot add google event for now'), 'data' => $item]);
        }
        return $item;
    }

    /**
     * @param $data
     * @return \GuzzleHttp\Psr7\Request|JsonResponse
     */
    private function deleteGoogleEvent($data)
    {
        return $this->userService->deleteGoogleEvent($data);
    }

    /**
     * @param $data
     * @return \Google\Service\Calendar\Event|JsonResponse
     */
    private function updateGoogleNoteEvent($data)
    {
        $item = $this->userService->updateGoogleEvent($data);
        if (!$item) {
            return response()->json(['status' => false, 'message' => __('Can not update google event for now'), 'data' => $item]);
        }
        return $item;
    }

    /**
     * Update the user personal information.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updatePersonalInformation(Request $request): JsonResponse
    {
        $birthday = (bool)strtotime($request->birthday) ? Carbon::parse($request->birthday) : null;
        $userId = $request->input('userId');
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$userId;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $user = User::find($userId);

            //if the user doesn't exist we'll return error message
            if (empty($user)) {
                return response()->json(['status' => false, 'message' => __('invalid_user'), 'user' => null]);
            }
            $checkEmailUnique = trim($user->email) != trim($request->email) ? '|unique:users,email' : '';

            $userPersonalInformationData = [
                'name' => $request->name,
                'surname' => $request->surname,
                'patronymic' => $request->patronymic,
                'nickname' => $request->nickname,
//                'email' => $request->email,
                'birthday' => $birthday,
                'tin' => $request->tin,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'zip_code' => $request->zip_code,
                'deletedRelativesId' => $request->deletedRelativesId,
//                'about' => $request->about,
                'contacts' => $request->contacts,
                'family' => $request->family,
                'time_offset' => $request->time_offset,
                'family_status' => $request->family_status,
                'amountOfKids' => $request->amountOfKids,
                'spouseName' => $request->spouseName,
                'spouseBirthday' => $request->spouseBirthday,
                'spouseAddress' => $request->spouseAddress,
                'spousePhoneNumber' => $request->spousePhoneNumber,
            ];

            $validatedUserPersonalInformationData = Validator::make($userPersonalInformationData, [
                'name' => 'required|string|max:70',
                'surname' => 'required|string|max:70',
                'patronymic' => 'nullable|string|max:70',
                'nickname' => 'nullable|string|max:70',
//                'email' => 'required|email' . $checkEmailUnique,
                'birthday' => 'required|date',
                'gender' => 'required|int',
                'nationality' => 'nullable|string|max:70',
//                'about' => 'required|max:150',
                'family_status' => 'nullable|max:70',
                'amountOfKids' => 'nullable|int',
                'tin' => 'nullable|string|max:70',
                'spouseName' => 'nullable|string',
                'spouseBirthday' => 'nullable|date|date_format:Y-m-d',
                'spouseAddress' => 'nullable|string|max:150',
                'spousePhoneNumber' => 'nullable|string',
            ]);

            if ($validatedUserPersonalInformationData->fails()) {
                return response()->json(['status' => false, 'message' => $validatedUserPersonalInformationData->errors()]);
            } else {
                $contactsValidate = Validator::make($userPersonalInformationData['contacts'], [
                    'city.value' => 'nullable|string',
                    'city.type' => 'nullable|string',
                    'city.name' => 'nullable|string',
                    'address1.value' => 'required|string|max:150',
                    'address1.type' => 'required|string',
                    'address1.name' => 'required|string',
                    'address2.value' => 'required|string|max:150',
                    'address2.type' => 'required|string',
                    'address2.name' => 'required|string',
                ]);

                if ($contactsValidate->fails()) {
                    return response()->json(['status' => false, 'message' => $contactsValidate->errors()]);
                }
                if (!empty($request->spouseName)) {
                    $spouseData = [
                        "type" => 'spouse',
                        "full_name" => $request->spouseName,
                        "birthday" => $request->spouseBirthday,
                        "birthplace" => $request->spouseAddress,
                        "spousePhoneNumber" => $request->spousePhoneNumber,
                    ];
                    $this->userService->createOrUpdateSpouseData((int)$userId, $spouseData);
                }

                try {
                    foreach ($userPersonalInformationData['family'] as $type => $userRelatives) {
                        $this->updateOrCreateUserRelatives($userRelatives, $type, $user->id, $loggedUser, $isOwnerPage);
                    }

                    foreach ($userPersonalInformationData['contacts'] as $name => $userContact) {
                        $this->createOrUpdateUserContact($userContact, $user->id,$loggedUser,$isOwnerPage);
                    }

                    if ($userPersonalInformationData['deletedRelativesId'] && ($isOwnerPage || $loggedUser->can('delete', new UserContact()))) {
                        UserRelative::whereIn('id', $userPersonalInformationData['deletedRelativesId'])->delete();
                    }

                } catch (\Exception $e) {
                    return response()->json(['status' => false, 'message' => $e->getMessage()]);
                }

                $updateUser = $user->update($userPersonalInformationData);

                $updatedUserPersonalInfo = $this->getUserPersonalInfoData($userId);

                $updatedUserPersonalInfo->amountOfKids = $this->userService->getUserCountKids($userId);
                if ($updateUser && $updatedUserPersonalInfo) {
                    return response()->json(['status' => true, 'message' => __('The User Personal In formations edited successfully'), 'data' => $updatedUserPersonalInfo]);
                } else {
                    return response()->json(['status' => false, 'message' => __('Has not edited successfully, please try again'), 'data' => null]);
                }
            }
        }else {
            return response()->json(['status' => false, 'message' => __('You do not have access to edit the user')]);
        }
    }

    /**
     * add College info to db
     * @param UsersRemunerationJobTypeStoreRequest $request
     * @return JsonResponse
     */
    public function updateJobType(UsersRemunerationJobTypeStoreRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit job type') || ($isOwnerPage && $loggedUser->can('edit self job type'))) {
            $user = User::find($data['user_id']);
            $updateData = $user->update(['type' => $data['jobType']]);

            if ($updateData) {
                $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);

                if ($updatedUserRemuneration) {
                    return response()->json(['status' => true, 'message' => __('The User Job Type updated successfully'), 'data' => $updatedUserRemuneration]);
                }
            }

            return response()->json(['status' => false, 'message' => __("We couldn't update a Job type"), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * Add User Salary To DB
     * @param UsersRemunerationAddSalaryRequest $request
     * @return JsonResponse
     */
    public function addUserSalary(UsersRemunerationAddSalaryRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $checkRemunerationAdd = $loggedUser->can('create', UserSalary::class);

            if ($checkRemunerationAdd) {
                UserSalary::where("user_id", $data['user_id'])->update(['status' => 0]);

                $newSalary = [
                    'user_id' => $data['user_id'],
                    'salary' => $data['salary'],
                    'true_cost' => $data['true_cost'],
                    'status' => 1,
                    'rate' => $data['rate'],
                    'date' => (bool)strtotime($data['date']) ? Carbon::parse($data['date']) : null,
                ];

                $addedSalary = UserSalary::create($newSalary);

                if ($addedSalary) {
                    $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);

                    if ($updatedUserRemuneration) {
                        return response()->json(['status' => true, 'message' => __('The User Salary added successfully'), 'data' => $updatedUserRemuneration]);
                    }
                }

                return response()->json(['status' => false, 'message' => __("We couldn't add a Salary"), 'data' => null]);

            }

            return response()->json(['status' => false, 'message' => __('You do not have access to add user Salary'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * Update User Salary
     * @param UsersRemunerationUpdateSalaryRequest $request
     * @return JsonResponse
     */
    public function updateUserSalary(UsersRemunerationUpdateSalaryRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $salary = UserSalary::where("id", $data['id'])->first();
            if ($loggedUser->can('update', $salary)) {

                $toUpdateData = [
                    'salary' => $data['salary'],
                    'true_cost' => $data['true_cost'],
                    'rate' => $data['rate'],
                    'date' => (bool)strtotime($data['date']) ? Carbon::parse($data['date']) : null,
                ];
                $salary->fill($toUpdateData);
                if ($salary->save()) {
                    $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);

                    if ($updatedUserRemuneration) {
                        return response()->json(['status' => true, 'message' => __('The User Salary updated successfully'), 'data' => $updatedUserRemuneration]);
                    }
                }

                return response()->json(['status' => false, 'message' => __("We couldn't update a Salary"), 'data' => null]);

            }

            return response()->json(['status' => false, 'message' => __('You do not have access to update user Salary'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * add College info to db
     * @param UsersRemunerationAddBonusRequest $request
     * @return JsonResponse
     */
    public function addUserBonus(UsersRemunerationAddBonusRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $checkBonusesAdd = $loggedUser->can('create', UserBonus::class);

            if ($checkBonusesAdd) {
                $bonus = [
                    'user_id' => $data['user_id'],
                    'bonus' => $data['bonus'],
                    'date' => (bool)strtotime($data['date']) ? Carbon::parse($data['date']) : null,
                ];

                $addedBonus = UserBonus::create($bonus);
                if ($addedBonus) {
                    $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);

                    if ($updatedUserRemuneration) {
                        return response()->json(['status' => true, 'message' => __('The User Bonus added successfully'), 'data' => $updatedUserRemuneration]);
                    }
                }

                return response()->json(['status' => false, 'message' => __("We couldn't add a Bonus"), 'data' => null]);
            }

            return response()->json(['status' => false, 'message' => __('You do not have access to add user Bonus'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * Update User Bonus
     * @param UsersRemunerationUpdateBonusRequest $request
     * @return JsonResponse
     */
    public function updateUserBonus(UsersRemunerationUpdateBonusRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $bonus = UserBonus::where("id", $data['id'])->first();
            if ($loggedUser->can('update', $bonus)) {
                $toUpdateData = [
                    'bonus' => $data['bonus'],
                    'date' => (bool)strtotime($data['date']) ? Carbon::parse($data['date']) : null,
                ];
                $bonus->fill($toUpdateData);
                if ($bonus->save()) {
                    $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);

                    if ($updatedUserRemuneration) {
                        return response()->json(['status' => true, 'message' => __('The User Bonus updated successfully'), 'data' => $updatedUserRemuneration]);
                    }
                }

                return response()->json(['status' => false, 'message' => __("We couldn't update a Bonus"), 'data' => null]);

            }

            return response()->json(['status' => false, 'message' => __('You do not have access to update user Bonus'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * remove User Bonus or Other Spends
     * @param UserRemunerationDeleteBonusesRequest $request
     * @return JsonResponse
     */
    public function deleteUserBonus(UserRemunerationDeleteBonusesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$data['id'];
        if ($loggedUser->can('delete bonus') || ($isOwnerPage && $loggedUser->can('delete self bonus'))) {
            $deletedItem = $this->userService->deleteUserBonus($data['id'], $data['user_id'], $data['type']);
            if ($deletedItem) {
                $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);
                if ($updatedUserRemuneration) {
                    return response()->json([
                        'status' => true,
                        'message' =>  __('Deleted successfully'),
                        'data' => [
                            'userRemuneration' => $updatedUserRemuneration,
                            'jobTypes' => $this->userService->getUserJobTypes(),
                            'levels' => $this->userService->getUserLevels(),
                        ]
                    ]);
                }
            }
            return response()->json(['status' => false, 'message' => __("We couldn't deleted"), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __('You do not have access to delete'), 'data' => null]);
    }

    /**
     * remove User Salary
     * @param UserDeleteSalaryRequest $request
     * @return JsonResponse
     */
    public function deleteUserSalary(UserDeleteSalaryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$data['id'];
        if ($loggedUser->can('delete salary') || ($isOwnerPage && $loggedUser->can('delete self salary'))) {
            $deletedItem = $this->userService->deleteUserSalary($data['id'], $data['user_id']);
            if ($deletedItem) {
                $updatedUserRemuneration = $this->getUserRemuneration($data['user_id']);
                if ($updatedUserRemuneration) {
                    return response()->json([
                        'status' => true,
                        'message' =>  __('Deleted successfully'),
                        'data' => [
                            'userRemuneration' => $updatedUserRemuneration,
                            'jobTypes' => $this->userService->getUserJobTypes(),
                            'levels' => $this->userService->getUserLevels(),
                        ]
                    ]);
                }
            }
            return response()->json(['status' => false, 'message' => __("We couldn't deleted"), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __("You do not have access to delete"), 'data' => null]);
    }

    /**
     * @param UsersRemunerationUpdateRequest $request
     * @return JsonResponse
     */
    public function updateRemuneration(UsersRemunerationUpdateRequest $request): JsonResponse
    {
        $data = $request->validated();
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$data['id'];
        try {
            if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
                $this->userService->edit(['type' => $data['job_type']], $data['id']);

                $canAddSalary = $loggedUser->can('add salary');
                $canAddSelfSalary = $loggedUser->can('add self salary');
                $canEditSalary = $loggedUser->can('edit salary');
                $canEditSelfSalary = $loggedUser->can('edit self salary');
                $touchedSalaryIds = [];
                $oldSalaryIds = $this->userService->getUserSalaryIds($data['id']);
                if (!empty($data['salaries'])) {
                    // validate salaries (start_date, end_date) and add correct status 0 or 1
                    $utcNow = Carbon::now($loggedUser->time_offset)->setTimezone(config('app.timezone'));
                    $salariesPeriodCollection = null;
                    $salariesPeriods = [];
                    $salaryEndDateEmptyCount = 0;
                    foreach ($data['salaries'] as $salary) {
                        if ($salaryEndDateEmptyCount > 1) break;
                        $startDateTime = Carbon::parse($salary['start_date'], $loggedUser->time_offset)->timezone(config('app.timezone'));
                        $endDateTime = !empty($salary['end_date'])
                            ? Carbon::parse($salary['end_date'], $loggedUser->time_offset)->timezone(config('app.timezone'))
                            : $utcNow;

                        if (empty($salary['end_date'])) $salaryEndDateEmptyCount++;
                        $salariesPeriods[] = Period::make($startDateTime, $endDateTime, Precision::HOUR, Boundaries::EXCLUDE_END);
                    }

                    if ($salaryEndDateEmptyCount > 1) {
                        return response()->json(['status' => false, 'message' => __('The salaries start-end date ranges intersection'), 'data' => null]);
                    }

                    $intersectRanges = false;
                    if (!empty($salariesPeriods)) {
                        $salariesPeriodsCount = count($salariesPeriods);
                        for ($i = 0; $i < $salariesPeriodsCount; $i++){
                            if ($intersectRanges) break;
                            for ($j = 0; $j < $salariesPeriodsCount; $j++){
                                if ($i === $j) continue;
                                if ($salariesPeriods[$i]->overlapsWith($salariesPeriods[$j])) {
                                    $intersectRanges = true;
                                    break;
                                }
                            }
                        }
                    }
                    if ($intersectRanges) {
                        return response()->json(['status' => false, 'message' => __('The salaries start-end date ranges intersection'), 'data' => null]);
                    }
                    $boundariesEnd = null;
                    foreach ($data['salaries'] as $salary) {
                        if ($boundariesEnd === null) {
                            if (empty($salary['end_date'])) {
                                $boundariesEnd = $utcNow;
                            } else {
                                $boundariesEnd = Carbon::parse($salary['end_date']);
                            }
                        } else {
                            if (!empty($salary['end_date'])) {
                                $salaryEnd = Carbon::parse($salary['end_date']);
                                if ($boundariesEnd < $salaryEnd) {
                                    $boundariesEnd = $salaryEnd;
                                }
                            }
                        }
                    }
                    if ($boundariesEnd !== null) {
                        $boundariesEnd = $boundariesEnd->toDateString();
                    }
                    $countOfSalaries = count($data['salaries']);
                    foreach ($data['salaries'] as $salary) {
                        $salary['status'] = 0; // important
                        if ($countOfSalaries > 1) {
                            if (empty($salary['end_date']) || $boundariesEnd === $salary['end_date']) {
                                $salary['status'] = 1;
                            }
                        } else if ($countOfSalaries === 1) {
                            $salary['status'] = 1;
                        }

                        $salary['user_id'] = $data['id']; // important
                        if (empty($salary['id'])) { // new item
                            if ($canAddSalary || ($isOwnerPage && $canAddSelfSalary)) {
                                $this->userService->addUserSalary($salary);
                            }
                        } else { // edit item
                            $touchedSalaryIds[] = (int)$salary['id'];
                                if ($canEditSalary || ($isOwnerPage && $canEditSelfSalary)) {
                                $userSalary = $this->userService->getUserSalaryById($salary['id'], $data['id']);
                                if (!empty($userSalary)) {
                                    $this->userService->updateUserSalary($userSalary, $salary);
                                }
                            }
                        }
                    }
                }
                // deleting removed old salary items
                if (!empty($oldSalaryIds) && $loggedUser->can('delete salary')) {
                    $removeSalaryIds = array_diff($oldSalaryIds, $touchedSalaryIds);
                    $this->userService->removeUserSalaries($removeSalaryIds, $data['id']);
                }

                $canAddBonus = $loggedUser->can('add bonus');
                $canAddSelfBonus = $loggedUser->can('add self bonus');
                $canEditBonus = $loggedUser->can('edit bonus');
                $canEditSelfBonus = $loggedUser->can('edit self bonus');
                $touchedBonusesOtherSpendsIds = [];
                $oldBonusesOtherSpendsIds = $this->userService->getUserBonusIds($data['id']);
                $canAddOtherSpendsBonus = $loggedUser->can('add other spends');
                $canAddSelfOtherSpendsBonus = $loggedUser->can('add self other spends');
                if (!empty($data['bonusesOtherSpends'])) {
                    foreach ($data['bonusesOtherSpends'] as $bonusOtherSpend) {
                        $bonusOtherSpend['user_id'] = $data['id']; // important
                        if (empty($bonusOtherSpend['id'])) { // new item
                            if ($canAddBonus || ($isOwnerPage && $canAddSelfBonus) || $canAddOtherSpendsBonus || ($isOwnerPage && $canAddSelfOtherSpendsBonus)) {
                                $this->userService->addUserBonus($bonusOtherSpend);
                            }
                        } else { // edit item
                            $touchedBonusesOtherSpendsIds[] = (int)$bonusOtherSpend['id'];
                            if ($canEditBonus || ($isOwnerPage && $canEditSelfBonus)) {
                                $userBonus = $this->userService->getUserBonusById($bonusOtherSpend['id'], $data['id']);
                                if (!empty($userBonus)) {
                                    $this->userService->updateUserBonus($userBonus, $bonusOtherSpend);
                                }
                            }
                        }
                    }
                }
                // deleting removed old bonuses
                if (!empty($oldBonusesOtherSpendsIds) && $loggedUser->can('delete bonus')) {
                    $removeBonusesOtherSpendsIds = array_diff($oldBonusesOtherSpendsIds, $touchedBonusesOtherSpendsIds);
                    $this->userService->removeUserBonuses($removeBonusesOtherSpendsIds, $data['id']);
                }

                $updatedUserRemuneration = $this->getUserRemuneration($data['id']);
                if ($updatedUserRemuneration) {
                    return response()->json([
                        'status' => true,
                        'message' =>  __('The User Remuneration edited successfully'),
                        'data' => [
                            'userRemuneration' => $updatedUserRemuneration,
                            'jobTypes' => $this->userService->getUserJobTypes(),
                            'levels' => $this->userService->getUserLevels(),
                        ]
                    ]);
                }
            } else {
                return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
            }
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage(), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __('Something went wrong'), 'data' => null]);
    }

    /**
     * Update the user job information.
     *
     * @param UsersUpdateJobInformationRequest $request
     * @return JsonResponse
     */
    public function updateJobInformation(UsersUpdateJobInformationRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $user = User::find($userId);
            //if the user doesn't exist we'll return error message
            if (empty($user)) {
                return response()->json(['status' => false, 'message' => __('invalid_user'), 'user' => null]);
            }

            //user Professional Story
            $this->userService->updateUserProfessionalStory($userId, $request->input('professional_story'));
            //user roles checking
            $userRole = null;
            if (isset($request->role)) {
                $allRoles = Role::all()->pluck('name')->toArray();
                $userRole = $request->role ? $request->role : null;
                if (!in_array($userRole, $allRoles)) {
                    return response()->json(['status' => false, 'message' => __('invalid_user_role'), 'user' => null]);
                }
            }

            //user status change
            if (isset($request->status)) {
                $this->userService->changeUserStatus($userId, $request->status);
            }

            // Add/Edit user jobs
            if (!empty($request->jobs)) {
                foreach ($request->jobs as $job) {
                    if (!empty($job['id'])) { // edit item
                        $userJobInformation = $this->userJobInformationService->getItemByUserIdAndId($userId, $job['id']);
                    } else { // add item
                        $userJobInformation = $this->userJobInformationService->getModel();
                    }
                    if ($loggedUser->can('view', $userJobInformation) ||
                        ($isOwnerPage && $loggedUser->can('viewSelfJobInformation', $userJobInformation))) {
                        $jobInformationFillData = [
                            "user_id" => $userId,
                            "interview" => $job['interview'] ?? null,
                            "work_contract" => $job['work_contract'] ?? null,
                            "work_contract_start_date" => $job['work_contract_start_date'] ?? null,
                            "work_contract_end_date" => $job['work_contract_end_date'] ?? null,
                            "experimental_period_start_date" => $job['experimental_period_start_date'] ?? null,
                            "experimental_period_end_date" => $job['experimental_period_end_date'] ?? null,
                            "position" => $job['position'] ?? null,
                            "position_description" => $job['position_description'] ?? null,
                            "company_name" => $job['company_name'] ?? null,
                            "location" => $job['location'] ?? null,
                        ];

                        if (!empty($userJobInformation->id)) { // edit item
                            $this->userJobInformationService->edit($jobInformationFillData, $userJobInformation->id);
                        } else { // add item
                            $this->userJobInformationService->add($jobInformationFillData);
                        }
                    }
                }
            }

            if (isset($request->role)) {
                //save user role
                $user->syncRoles($userRole);
            }

            // Add/Delete user skills
            if (isset($request->skills)) {
                $skillIds = [];
                $skillsToAdd = [];
                $querySkills = $this->userService->getQuerySkills();
                $skillNames = $querySkills->pluck('name')->toArray();
                foreach ($request->skills as $skillData) {
                    if (array_key_exists('id', $skillData)) {
                        $skillIds[] = $skillData['id'];
                    }
                    $skillName = trim($skillData['name']);
                    if (!empty($skillName) && !in_array($skillName, $skillNames)) {
                        $nowDateTime = Carbon::now();
                        $skillsToAdd[] = [
                            'name' => $skillName,
                            'created_at' => $nowDateTime,
                            'updated_at' => $nowDateTime,
                        ];
                    }
                }
                if (!empty($skillsToAdd)) {
                    foreach ($skillsToAdd as $data) {
                        $skillIds[] = $this->userService->insertAndGetInsertedSkillIds($data);
                    }
                }
                $checkedSkillIds = $this->userService->getCheckedSkillIds($skillIds);
                $existingSkillsIds = $this->userService->getExistingSkillsIds($userId);
                $skillsToSave = array_diff($checkedSkillIds, $existingSkillsIds);
                $skillsToDelete = array_diff($existingSkillsIds, $checkedSkillIds);
                if (!empty($skillsToSave)) {
                    $this->userService->insertUserSkills($userId, $skillsToSave);
                }
                if (!empty($skillsToDelete)) {
                    $this->userService->deleteUserSkills($userId, $skillsToDelete);
                }
            }

            // Add/Delete user soft skills
            if (isset($request->soft_skills)) {
                $softSkillIds = [];
                $softSkillsToAdd = [];
                $querySoftSkills = $this->userService->getQuerySoftSkills();
                $softSkillNames = $querySoftSkills->pluck('name')->toArray();
                foreach ($request->soft_skills as $softSkillData) {
                    if (array_key_exists('id', $softSkillData)) {
                        $softSkillIds[] = $softSkillData['id'];
                    }
                    $nowTime = Carbon::now();
                    $softSkillName = trim($softSkillData['name']);
                    if (!empty($softSkillName) && !in_array($softSkillName, $softSkillNames)) {
                        $softSkillsToAdd[] = [
                            'name' => $softSkillName,
                            'created_at' => $nowTime,
                            'updated_at' => $nowTime,
                        ];
                    }
                }
                if (!empty($softSkillsToAdd)) {
                    foreach ($softSkillsToAdd as $data) {
                        $softSkillIds[] = $this->userService->insertAndGetInsertedSoftSkillIds($data);
                    }
                }
                $checkedSoftSkillIds = $this->userService->getCheckedSoftSkillIds($softSkillIds);
                $existingSoftSkillsIds = $this->userService->getExistingSoftSkillsIds($userId);
                $softSkillsToSave = array_diff($checkedSoftSkillIds, $existingSoftSkillsIds);
                $softSkillsToDelete = array_diff($existingSoftSkillsIds, $checkedSoftSkillIds);
                if (!empty($softSkillsToSave)) {
                    $this->userService->insertUserSoftSkills($userId, $softSkillsToSave);
                }
                if (!empty($softSkillsToDelete)) {
                    $this->userService->deleteUserSoftSkills($userId, $softSkillsToDelete);
                }
            }

            //user status
            if (isset($request->status)) {
                $user->status = $request->status;
                $user->save();
            }
            $updatedUserJobInfo = $this->getUserJobInfoData($user->id);

            if ($updatedUserJobInfo) {
                return response()->json(['status' => true, 'message' => __('The User Job Information edited successfully'), 'data' => $updatedUserJobInfo]);
            }
            return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * Update the user job information.
     * @param UsersDeleteJobInformationRequest $request
     * @return JsonResponse
     */
    public function removeJobInformation(UsersDeleteJobInformationRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        $id = $request->input('id');
        $userId = $request->input('userId');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;

        $jobInformation = $this->userJobInformationService->find($id);

        if ($loggedUser->can('delete', $jobInformation) || ($isOwnerPage && $loggedUser->can('deleteSelfJobInformation', $jobInformation))) {
            $deletedUserJobInfo = $this->userJobInformationService->delete($jobInformation->id);
            if ($deletedUserJobInfo) {
                return response()->json(['status' => true, 'message' => __('The User Job Information deleted successfully'), 'data' => $deletedUserJobInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * add the user social network information.
     * @param UsersContactInfoSocialNetworksStoreRequest $request
     * @return JsonResponse
     */

    public function addSocialNetwork(UsersContactInfoSocialNetworksStoreRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {

            $checkContactsPermissionsAdd = (
                ($loggedUser->can('createSelfContacts', new UserContact()) && $isOwnerPage) ||
                $loggedUser->can('create', new UserContact())
            );

            if ($checkContactsPermissionsAdd) {

                $contact = [
                    'user_id' => $request['user_id'],
                    'type' => $request['type'],
                    'name' => $request['nameSocialNetwork'],
                    'value' => $request['nameUserSocialNetwork'],
                    'icon' => $request['nameSocialNetwork'],
                    'link' => $request['linkSocialNetwork'],
                ];

                $addedContact = UserContact::create($contact);

                if ($addedContact) {
                    $updatedUserContactInformation = $this->getUserContactInformation($contact['user_id']);

                    if ($updatedUserContactInformation) {
                        return response()->json(['status' => true, 'message' => __('The User Social Network added successfully'), 'data' => $updatedUserContactInformation]);
                    }
                } else {
                    return response()->json(['status' => false, 'message' => __("We couldn't add a social network"), 'data' => null]);
                }
            }

            return response()->json(['status' => false, 'message' => __('You do not have access add Social Network'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * @param UsersWebSiteStoreRequest $request
     * @return JsonResponse
     */
    public function addWebSite(UsersWebSiteStoreRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = $request->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $checkContactsPermissionsAdd = (
                ($loggedUser->can('createSelfContacts', new UserContact()) && $isOwnerPage) ||
                $loggedUser->can('create', new UserContact())
            );

            if ($checkContactsPermissionsAdd) {
                $contact = [
                    'user_id' => $data['user_id'],
                    'type' => $data['type'],
                    'name' => $data['webSiteTitleLink'],
                    'value' => $data['webSiteUrl']
                ];

                $addedContact = UserContact::create($contact);

                if ($addedContact) {
                    $updatedUserContactInformation = $this->getUserContactInformation($contact['user_id']);

                    if ($updatedUserContactInformation) {
                        return response()->json(['status' => true, 'message' => __('The User Website added successfully'), 'data' => $updatedUserContactInformation]);
                    }
                } else {
                    return response()->json(['status' => false, 'message' => __("We couldn't add a WebSite"), 'data' => null]);
                }
            }

            return response()->json(['status' => false, 'message' => __('You do not have access add Website'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }


    /**
     * @param UsersContactInfoUpdateWorkNumberAndEmailRequest $request
     * @return JsonResponse
     */
    public function updateUserContactInformation(UsersContactInfoUpdateWorkNumberAndEmailRequest $request): JsonResponse
    {
        $data = $request->all();
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
                $checkContactsPermissionsAdd = (
                    ($loggedUser->can('createSelfContacts', new UserContact()) && $isOwnerPage) ||
                    $loggedUser->can('create', new UserContact())
                );

                $contact = [];

                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['workedEmailType'],
                    "name" => $data['workedEmailName'],
                    "value" => $data['workEmail'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['workedNumberType'],
                    "name" => $data['workedNumberName'],
                    "value" => $data['workNumber'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['personalNumberType'],
                    "name" => $data['personalNumberName'],
                    "value" => $data['personalNumber'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['otherPhoneNumberType'],
                    "name" => $data['otherPhoneNumberName'],
                    "value" => $data['otherPhoneNumber'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['homeNumberType'],
                    "name" => $data['homeNumberName'],
                    "value" => $data['homeNumber'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['extraNumberType'],
                    "name" => $data['extraNumberName'],
                    "value" => $data['extraNumber'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['personalEmailType'],
                    "name" => $data['personalEmailName'],
                    "value" => $data['personalEmail'],
                ];
                $contact[] = [
                    "user_id" => $data['user_id'],
                    "type" => $data['extraNameType'],
                    "name" => $data['extraNameName'],
                    "value" => $data['extraName'],
                ];


                $contactsCount = count($contact);

                for ($i = 0; $i < $contactsCount; $i++) {
                    $exist = UserContact::where([
                        ["user_id", "=", $contact[$i]['user_id']],
                        ['type', '=', $contact[$i]['type']],
                    ])->first();

                    if ($exist) {
                        $checkContactsPermissionsUpdate = (
                            ($loggedUser->can('updateSelfContacts', $exist) && $isOwnerPage) ||
                            $loggedUser->can('update', $exist)
                        );

                        $checkContactsPermissionsUpdate && $exist->update($contact[$i]);
                    } else {
                        $checkContactsPermissionsAdd && UserContact::create($contact[$i]);
                    }
                }

                $updatedUserContactInformation = $this->getUserContactInformation($data['user_id']);

                if ($updatedUserContactInformation) {
                    return response()->json(['status' => true, 'message' => __('The User Contact Information updated successfully'), 'data' => $updatedUserContactInformation]);
                }
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    public function deleteItemContactInfo(UsersContactInfoDeleteRequest $request)
    {
        $data = $request->all();
        $loggedUser = auth()->user();
        $isOwnerPage = (int)$loggedUser->id === (int)$request->user_id;

        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {

            if (($isOwnerPage || $loggedUser->can('delete', new UserContact()))) {
                $deletedItem = UserContact::where('id', $data['deleteId'])->delete();

                if ($deletedItem) {
                    $updatedUserContactInformation = $this->getUserContactInformation($data['user_id']);

                    if ($updatedUserContactInformation) {
                        return response()->json(['status' => true, 'message' => __('Deleted successfully'), 'data' => $updatedUserContactInformation]);
                    }

                } else {
                    return response()->json(['status' => false, 'message' => __("We couldn't delete"), 'data' => null]);
                }
            }

            return response()->json(['status' => false, 'message' => __('You do not have access delete'), 'data' => null]);
        }

        return response()->json(['status' => false, 'message' => __('You do not have access to edit the user'), 'data' => null]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function updateEduInformation(Request $request)
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            if ($request->type === 'college') {
                $data = $this->createOrUpdateCollegeInformation($request);
            } elseif ($request->type === 'school') {
                $data = $this->createOrUpdateSchoolInformation($request);
            } elseif ($request->type === 'language') {
                $data = $this->updateLanguageInformation($request);
            } elseif ($request->type === 'military') {
                $data = $this->createOrUpdateMilitaryInformation($request);
            } elseif ($request->type === 'university') {
                $data = $this->createOrUpdateUniversityInformation($request);
            }
            return $data;
        }
    }

    /**
     * Update the user documents.
     *
     * @param UsersUpdateUserDocumentRequest $request
     * @return JsonResponse
     */
    public function updateUserDocuments(UsersUpdateUserDocumentRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('user_id');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        $document = $request->file('document');
        $type = $request->input('type');
        $name = $request->input('name');
        $fileType = $request->input('file_type');
        $size = $request->input('size');

        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        if (($loggedUser->can('createSelfDocuments', new UserDocument()) && $isOwnerPage) ||
            $loggedUser->can('create', new UserDocument())) {
            $user = User::find($userId);
            $userDocuments = $user->documents; // get user documents
            $this->setDirectory('public/documents/' . $userId); // set directory for uploading document
            if (is_object($userDocuments)) {
                foreach ($userDocuments as $userDocument) {
                    $userDocument = $userDocument->toArray();
                    // if new document name already exist
                    if ($userDocument['name'] === $name) {
                        return response()->json(['status' => false, 'message' => __('The document already exists')]);
                    }
                }
            }
            $uploadResult = $this->upload($document);
            if ($uploadResult['success']) {
                UserDocument::create([
                    'user_id' => $userId,
                    'uploader_id' => $loggedUser->id,
                    'name' => $name,
                    'type' => $type,
                    'file' => $uploadResult['name'],
                    'size' => $size,
                    'file_type' => $fileType
                ]);

                $userDocuments = $this->getUserDocumentsData($userId);

                if ($userDocuments) {
                    return response()->json(['status' => true, 'message' => __('The User Documents Information edited successfully'), 'data' => $userDocuments]);
                }
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * add College info to db
     * @param UsersUpdateCollegeInformationRequest $request
     * @return JsonResponse
     */
    public function createOrUpdateCollegeInformation(UsersUpdateCollegeInformationRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int)$loggedUser->id === (int)$userId;
        $formId = $request->input('formId');
        $model = $this->userEducationService->getModel();
        $canAddUserEducation = $loggedUser->can('create', $model) || ($isOwnerPage && $loggedUser->can('createSelfEducation', $model));
        $canEditUserEducation = $loggedUser->can('update', $model) || ($isOwnerPage && $loggedUser->can('updateSelfEducation', $model));
        if ($canAddUserEducation && is_null($formId)) {
            if ($this->userEducationService->createCollegeInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('College Information Created Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        if ($canEditUserEducation) {
            if ($this->userEducationService->updateCollegeInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('College Information Updated Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), "data" => null]);
    }

    /**
     * add school info to db
     * @param UsersUpdateSchoolInformationRequest $request
     * @return JsonResponse
     */
    public function createOrUpdateSchoolInformation(UsersUpdateSchoolInformationRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        $model = $this->userEducationService->getModel();
        $formId = $request->input('formId');
        $canAddUserEducation = $loggedUser->can('create', $model) || ($isOwnerPage && $loggedUser->can('createSelfEducation', $model));
        $canEditUserEducation = $loggedUser->can('update', $model) || ($isOwnerPage && $loggedUser->can('updateSelfEducation', $model));
        if ($canAddUserEducation && is_null($formId)) {
            if ($this->userEducationService->createSchoolInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('School Information Created Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        if ($canEditUserEducation) {
            if ($this->userEducationService->updateSchoolInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('School Information Created Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), "data" => null]);
    }

    /**
     * add university info to db
     * @param UpdateUserUniversityInformationRequest $request
     * @return JsonResponse
     */
    public function createOrUpdateUniversityInformation(UpdateUserUniversityInformationRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        $model = $this->userEducationService->getModel();
        $formId = $request->input('formId');
        $canAddUserEducation = $loggedUser->can('create', $model) || ($isOwnerPage && $loggedUser->can('createSelfEducation', $model));
        $canEditUserEducation = $loggedUser->can('update', $model) || ($isOwnerPage && $loggedUser->can('updateSelfEducation', $model));
        if ($canAddUserEducation && is_null($formId)) {
            if ($this->userEducationService->createUniversityInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('University Information Created Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        if ($canEditUserEducation) {
            if ($this->userEducationService->updateUniversityInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('University Information Updated Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), "data" => null]);

    }

    /**
     * add languages to db
     * @param UsersUpdateLanguageInformationRequest $request
     * @return JsonResponse
     */
    public function updateLanguageInformation(UsersUpdateLanguageInformationRequest $request)
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int) $loggedUser->id === (int) $userId;
        $model = $this->userLanguageService->getModel();
        if ($loggedUser->can('update', $model) || ($isOwnerPage && $loggedUser->can('updateSelfLanguage', $model))) {
            if ($this->userLanguageService->updateOrCreateLanguageInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);

                return response()->json(['status' => true, 'message' => __('Language Information Updated Successfully'), "data" => $updatedUserEduInfo]);
            }
            return response()->json(['status' => false, 'message' => __('something_went_wrong'), "data" => null]);
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), "data" => null]);
    }

    /**
     * add military info to db
     * @param UsersUpdateMilitaryInformationRequest $request
     * @return JsonResponse
     */
    public function createOrUpdateMilitaryInformation(UsersUpdateMilitaryInformationRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('id');
        $isOwnerPage = (int)$loggedUser->id === (int)$userId;
        $model = $this->userEducationService->getModel();
        $formId = $request->input('formId');
        $canAddUserEducation = $loggedUser->can('create', $model) || ($isOwnerPage && $loggedUser->can('createSelfEducation', $model));
        $canEditUserEducation = $loggedUser->can('update', $model) || ($isOwnerPage && $loggedUser->can('updateSelfEducation', $model));
        if ($canAddUserEducation && is_null($formId)) {
            if ($this->userEducationService->createMilitaryInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('Military Information Created Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        if ($canEditUserEducation) {
            if ($this->userEducationService->updateMilitaryInformation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('Military Information Updated Successfully'), "data" => $updatedUserEduInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), "data" => null]);
    }

    /**
     * @param UsersRemoveDocumentRequest $request
     * @return JsonResponse
     */
    public function removeDocument(UsersRemoveDocumentRequest $request)
    {
        $loggedUser = auth()->user();
        $userId = $request->id;
        $fileId = $request->fileId;
        $fileName = $request->fileName;

        if (!$this->isValidUserId($userId)) {
            return response()->json(['status' => false, 'message' => __('invalid_user_id')]);
        }

        $file = UserDocument::find($fileId);

        if ($loggedUser->can('deleteSelfDocuments', $file) ||
            $loggedUser->can('delete', $file)) {
            if ($file) {
                $this->setDirectory('public/documents/' . $userId); // set directory for uploading document
                $isDelete = $this->delete($this->getDirectory() . $fileName);

                if (!$isDelete['success']) {
                    return response()->json(['status' => false, 'message' => __('The File doesn\'t exist'), 'data' => null]);
                }

                if ($file->delete()) {
                    $userDocuments = $this->getUserDocumentsData($userId);

                    return response()->json(['status' => true, 'message' => __('The document deleted!'), 'data' => $userDocuments]);
                }
            }
            return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }

    /**
     * @param UsersRemoveEducationRequest $request
     * @return JsonResponse
     */
    public function removeEducation(UsersRemoveEducationRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('user_id');
        $isOwnerPage = (int)$loggedUser->id === (int)$userId;
        if ($loggedUser->can('delete education') || ($isOwnerPage && $loggedUser->can('delete self education'))) {
            if ($this->userEducationService->removeEducation($request)) {
                $updatedUserEduInfo = $this->userService->getUserEducationInfoData($userId);
                return response()->json(['status' => true, 'message' => __('The education data deleted!'), 'data' => $updatedUserEduInfo]);
            }
        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
    }
    /**
     * @param NoteAddUpdateRequest $request
     * @return JsonResponse
     */
    public function updateOrCreateNotesInformation(NoteAddUpdateRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        if ($loggedUser->can('add note')) {
            if (!$request->input('set_reminder')) {
                if ($request->google_event_id) {
                    $noteData = [
                        "id" => $loggedUser->id,
                        "google_event_id" => $request->google_event_id,
                    ];
                    $event = $this->deleteGoogleEvent($noteData);

                    if (!$event['status']) {
                        $updatedUserNoteInfo = $this->getUserNotesInfoData($request['id']);
                        return response()->json(['status' => false, 'message' => __("You don't have permission for deleting this note!"),
                            'data' => $updatedUserNoteInfo]);
                    }
                }
                $this->userService->updateOrCreateNotesInformation($request, $loggedUser->id);
            } else {
                $noteData = [
                    "user_id" => $loggedUser->id,
                    "item" => !$request->input('google_event_id') ? 'Note for ' . $request->input('user_name') : $request->input('google_event_id'),
                    "start_date_time" => $request->reminderDate,
                    "all_day" => (bool)$request->all_day,
                    "end_date_time" => $request->end_date_time,
                    "time_offset" => $loggedUser->time_offset,
                    "description" => $request->note,
                    "google_event_id" => $request->google_event_id,
                ];
                $event = !$request->google_event_id ? $this->addNoteAsGoogleEvent($noteData) : $this->updateGoogleNoteEvent($noteData);
                if (isset($event->original) && $event->original['status'] || isset($event->status) && $event->status == 'confirmed') {
                    $this->userService->updateOrCreateNotesInformation($request, $loggedUser->id, $event->id);
                } else {
                    $this->userService->updateOrCreateNotesInformation($request, $loggedUser->id);
                    $updatedUserNotesInfo = $this->getUserNotesInfoData($request->id);
                    return response()->json(['status' => true, 'dbMessage' => __('The User notes Information added successfully'),
                        'googleMessage' => __("You don't have permission for adding this note as Google event!"),
                        'data' => $updatedUserNotesInfo]);
                }
            }
            $updatedUserNotesInfo = $this->getUserNotesInfoData($request->id);
            if ($updatedUserNotesInfo) {
                return response()->json(['status' => true, 'dbMessage' => __('The User notes Information edited successfully'),
                    'data' => $updatedUserNotesInfo]);
            }
        }
    }

    /**
     * @param NoteRemoveRequest $request
     * @return JsonResponse
     */
    public function removeNote(NoteRemoveRequest $request)
    {
        $loggedUser = auth()->user();
        $item = $this->userService->getNote($request['note_id']);
        if ($loggedUser->can('delete note', $item)) {
            if ($request->google_event_id) {
                $noteData = [
                    "id" => $loggedUser->id,
                    "google_event_id" => $request->google_event_id,
                ];
                $event = $this->deleteGoogleEvent($noteData);
                if (!$event['status']) {
                    $updatedUserNoteInfo = $this->getUserNotesInfoData($request['id']);
                    return response()->json(['status' => false, 'message' => __("You don't have permission for deleting this note!"),
                        'data' => $updatedUserNoteInfo]);
                }
            }
            if ($item) {
                $this->userService->removeNote($item->uuid);
            }
        }
        $updatedUserNoteInfo = $this->getUserNotesInfoData($request['id']);
        if ($updatedUserNoteInfo) {
            return response()->json(['status' => true, 'message' => __('The note  deleted successfully!'),
                'data' => $updatedUserNoteInfo]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadAvatar(Request $request)
    {
        $loggedUser = auth()->user();
        $avatar = $request->file('avatar');
        $userId = $request->input('id');
        $user = User::find($userId);
        $isOwnerPage = (int)$loggedUser->id === (int)$userId;

        if ($loggedUser->can('upload avatar') || ($isOwnerPage && $loggedUser->can('upload self avatar'))) {
            if (Storage::exists('public/images/avatars/' . $user->id)) {
                Storage::deleteDirectory('public/images/avatars/' . $user->id);
            }

            $this->setDirectory('public/images/avatars/' . $user->id); // set directory for uploading avatar
            $uploadAvatarResult = $this->upload($avatar);
            if ($uploadAvatarResult['success']) {
                $urlImage = '/' . $user->id . $uploadAvatarResult['name'];
                $fillData['avatar'] = $urlImage;
                $updateAvatar = User::where('id', $user->id)->update($fillData);

                if ($updateAvatar) {
                    return response()->json(['status' => true, 'message' => __('New avatar for this user uploaded successfully!'), 'data' => $isOwnerPage ? $urlImage : null]);
                } else {
                    return response()->json(['status' => false, 'message' => __('Sorry, we were not able to upload a new photo, please try again!'), 'data' => null]);
                }
            }

            return response()->json(['status' => false, 'message' => __('Sorry, we were not able to upload a new photo, please try again!'), 'data' => null]);
        } else {
            return response()->json(['status' => false, 'message' => __('You do not have sufficient permissions to upload the image!'), 'data' => null]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function updateDetails(Request $request)
    {
        $avatar = $request->file('avatar');
        $documents = $request->file('documents');
        $contacts = $request->input('contacts');
        $userId = $request->input('id');
        $editedEducations = json_decode($request->input('editedEducations'));
        $addEducations = json_decode($request->input('addEducations'));
        $deleteEducations = json_decode($request->input('deleteEducations'));
        $relativesData = $request->input('relativesData');
        $birthday = !empty($request->birthday) ? Carbon::parse($request->birthday) : null;
        $interview = !empty($request->interview) ? Carbon::parse($request->interview) : null;
        $work_contract =  !empty($request->work_contract)  ? Carbon::parse($request->work_contract) : null;
        $work_contract_start_date = !empty($request->work_contract_start_date) ? Carbon::parse($request->work_contract_start_date) : null;
        $experimental_period = !empty($request->experimental_period) ? Carbon::parse($request->experimental_period) : null;
        $request = json_decode($request->input('data'));
        $loggedUser = auth()->user();

        if ($loggedUser->can('edit users')) {
            $user = User::find($userId);
            if (empty($user)) {
                return response()->json(['status' => false, 'message' => __('invalid_user'), 'user' => null]);
            }

            $checkEmailUnique = trim($user->email) != trim($request->email) ? '|unique:users,email' : '';
            $contactsList = [];
            if ($contacts && count($contacts) > 0) {
                foreach ($contacts as $contactType => $contactList) {
                    foreach ($contactList as $contact) {
                        $contactsList[$contactType][] = (array)json_decode($contact);
                    }
                }
            }
            $validationArray = [
                'name' => $request->name,
                'surname' => $request->surname,
                'patronymic' => $request->patronymic,
                'birthday' => $birthday,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'birthplace' => $request->birthplace,
                'email' => $request->email,
                'status' => isset($request->status) ? $request->status : '',
                'avatar' => $avatar,
                'documents' => $documents,
                'contacts' => $contactsList,
                'time_offset' => $request->time_offset,
                'military_service' => $request->military_service,
            ];
            $validatedData = Validator::make($validationArray, [
                'name' => 'required|max:70',
                'surname' => 'required|max:70',
                'patronymic' => 'required|max:70',
                'birthday' => 'required|date',
                'gender' => 'required|int',
                'nationality' => 'max:191',
                'birthplace' => 'max:191',
                'residence_address' => 'max:191',
                'registration_address' => 'max:191',
                'email' => 'required|email' . $checkEmailUnique,
                'documents.*' => 'file|mimes:jpg,jpeg,png,txt,docx,doc,xlsx,pdf|max:' . env('MAX_FILE_UPLOAD_SIZE', 10240),
                'position' => 'max:191',
                'military_service' => 'string',
            ]);
            if ($validatedData->fails()) {
                return response()->json(['status' => false, 'message' => $validatedData->errors()]);
            }
            $user->time_offset = $request->time_offset;
            $user->military_service = $request->military_service;
            $allRoles = Role::all()->pluck('name')->toArray();
            $userRole = '';
            if (isset($request->role)) {
                $userRole = isset($request->role) ? $request->role : '';
                if (!in_array($userRole, $allRoles)) {
                    return response()->json(['status' => false, 'message' => __('invalid_user_role'), 'user' => null]);
                }
            }
            //personal information
            $fillData = [
                "name" => $request->name,
                "surname" => $request->surname,
                "patronymic" => $request->patronymic,
                'birthday' =>  $birthday,
                "gender" => $request->gender,
                "nationality" => $request->nationality,
                "birthplace" => $request->birthplace,
                "residence_address" => $request->residence_address,
                "registration_address" => $request->registration_address,
                "email" => $request->email,
                "type" => $request->type,
                "position" => isset($request->position) ? $request->position : '',
                "time_offset"=>$request->time_offset,
                "family_status" => isset($request->family_status) ? $request->family_status : '' ,
                "father" => isset($request->father) ? $request->father : '',
                "mother" => isset($request->mother) ? $request->mother : '' ,
                "spouse" => (isset($request->husband)) ? $request->husband : (isset($request->wife) ? $request->wife : '')
            ];
            //job informations
            $jobInformation = [
                "user_id" => $user->id,
                "interview" =>$interview ,
                "work_contract" =>$work_contract ,
                "work_contract_start_date" => $work_contract_start_date ,
                "experimental_period" => $experimental_period,
                "position" => isset($request->position) ? $request->position : null,
                "position_description" => isset($request->position_description) ? $request->position_description : null,
            ];
            //family data
            $relativesDataForInsert = [];
            foreach (json_decode($relativesData) as $key => $value) {
                if ($key === 'sisters') {
                    foreach ($request->sisters as $sister) {
                        $relativesDataForInsert[] = [
                            "user_id" => $user->id,
                            "type" => $key,
                            "name" => $sister,
                        ];
                    }
                }
                if ($key === 'brothers') {
                    foreach ($request->brothers as $brother) {
                        $relativesDataForInsert[] = [
                            "user_id" => $user->id,
                            "type" => $key,
                            "name" => $brother,
                        ];
                    }
                }
                if ($key === 'childrens') {
                    foreach ($request->childrens as $children) {
                        $relativesDataForInsert[] = [
                            "user_id" => $user->id,
                            "type" => $key,
                            "name" => $children,
                        ];
                    }
                }
            }
            //notes data
            $notes = [
                "user_id" => $user->id,
                "author_of_notes" => $loggedUser->id,
                "notes_text" => isset($request->notes_text) ? trim($request->notes_text) : null,
                "notes_type" => isset($request->notes_type) ? $request->notes_type : null,
                "created_at" => Carbon::now()->timezone(auth()->user()->time_offset)->setTimezone('UTC'),
                "updated_at" => Carbon::now()->timezone(auth()->user()->time_offset)->setTimezone('UTC'),
            ];
            //get user document object from db
            $userDocumentObject = UserDocument::where(['user_id' => $userId])->first();
            //if the user has no documents, we check only the create documents permission
            $checkDocumentsPermissions = (
                $loggedUser->can('createSelfDocuments', new UserDocument()) ||
                $loggedUser->can('create', new UserDocument())
            );
            //if the user has documents, we check all the documents permissions
            // Todo: checking permissions will be separate for each permission
            if ($userDocumentObject) {
                $checkDocumentsPermissions = (
                    ($loggedUser->can('createSelfDocuments', new UserDocument()) &&
                        $loggedUser->can('updateSelfDocuments', $userDocumentObject) &&
                        $loggedUser->can('deleteSelfDocuments', $userDocumentObject)) ||
                    ($loggedUser->can('create', new UserDocument()) &&
                        $loggedUser->can('update', $userDocumentObject) &&
                        $loggedUser->can('delete', $userDocumentObject))
                );
            }

            if ($checkDocumentsPermissions) {
                // Update/upload user documents
                if ($documents) {
                    if (is_array($documents)) {
                        $userDocuments = $user->documents; // get user documents
                        $this->setDirectory('public/documents/' . $userId); // set directory for uploading document
                        foreach ($documents as $type => $document) {
                            if (is_object($userDocuments)) {
                                foreach ($userDocuments as $userDocument) {
                                    $userDocument = $userDocument->toArray();
                                    // if new document type already exist, we'll delete old document and save new
                                    if ($userDocument['type'] === $type) {
                                        $this->delete($this->getDirectory() . '/' . $userDocument['file']);
                                    }
                                }
                            }
                            $uploadResult = $this->upload($document);
                            if ($uploadResult['success']) {
                                UserDocument::updateOrCreate(
                                    ['user_id' => $userId, 'type' => $type],
                                    ['uploader_id' => $loggedUser->id, 'file' => $uploadResult['name']]);
                            }
                        }
                    }
                }
            }

            //get user contact object from db
            $userContactObject = UserContact::where(['user_id' => $userId])->first();
            //if the user has no contacts, we check only the create contacts permission
            $checkContactsPermissions = (
                $loggedUser->can('createSelfContacts', new UserContact()) ||
                $loggedUser->can('create', new UserContact())
            );
            //if the user has contacts, we check all the contacts permissions
            // Todo: checking permissions will be separate for each permission
            if ($userContactObject) {
                $checkContactsPermissions = (
                    ($loggedUser->can('createSelfContacts', new UserContact()) &&
                        $loggedUser->can('updateSelfContacts', $userContactObject) &&
                        $loggedUser->can('deleteSelfContacts', $userContactObject)) ||
                    ($loggedUser->can('create', new UserContact()) &&
                        $loggedUser->can('update', $userContactObject) &&
                        $loggedUser->can('delete', $userContactObject))
                );
            }

            if ($checkContactsPermissions) {
                $userContactDeleteIds = [];
                $userContactIds = [];
                // get user contacts ids
                if (count($user->contacts) > 0) {
                    $userContactIds = $user->contacts()->get('id');
                }
                // if contacts exist
                if (count($contactsList) > 0) {
                    $contactsValidate = Validator::make($validationArray, [
                        'contacts.email.*.value' => 'email',
                        'contacts.email.*.type' => 'string',
                        'contacts.email.*.name' => 'string',
                        'contacts.other.*.value' => 'string',
                        'contacts.other.*.type' => 'string',
                        'contacts.other.*.name' => 'string',
                    ]);

                    if ($contactsValidate->fails()) {
                        return response()->json(['status' => false, 'message' => $contactsValidate->errors()]);
                    }

                    $newUserContactIds = [];
                    foreach ($contactsList as $type => $contactList) {
                        foreach ($contactList as $contact) {
                            if ($contact['id'] !== 'new') {
                                $newUserContactIds[] = $contact['id'];
                            } else {
                                UserContact::create([
                                    'value' => $contact['value'],
                                    'type' => $contact['type'],
                                    'name' => $contact['name'],
                                    'user_id' => $userId
                                ]);
                            }
                        }
                    }
                    if (count($userContactIds) > 0) {
                        foreach ($userContactIds as $userContactIdObject) {
                            if (!in_array($userContactIdObject->id, $newUserContactIds)) {
                                $userContactDeleteIds[] = $userContactIdObject->id;
                            }
                        }
                    }
                } else { // if new contacts doesn't exist but user contacts exist, we'll delete all the user contacts
                    if (count($userContactIds) > 0) {
                        foreach ($userContactIds as $userContactIdObject) {
                            $userContactDeleteIds[] = $userContactIdObject->id;
                        }
                    }
                }
                if (count($userContactDeleteIds) > 0) {
                    UserContact::destroy($userContactDeleteIds);
                }
            }

        // Update/upload user avatar
            if ($avatar) {
                $imgValidate = Validator::make($validationArray, [
                    'avatar' => 'file|mimes:jpeg,png,jpg|max:'.env('MAX_FILE_UPLOAD_SIZE', 10240),
                ]);
                if ($imgValidate->fails()) {
                    return response()->json(['status' => false, 'message' => __('invalid_image')]);
                }

                if (Storage::exists('public/images/avatars/' . $user->id)) {
                    Storage::deleteDirectory('public/images/avatars/' . $user->id);
                }
                $this->setDirectory('public/images/avatars/' . $user->id); // set directory for uploading avatar
                $uploadAvatarResult = $this->upload($avatar);
                if ($uploadAvatarResult['success']) {
                    $fillData['avatar'] = '/'.$user->id.$uploadAvatarResult['name'];
                }
            }

            $nowTime = Carbon::now()->timezone($loggedUser->time_offset)->setTimezone('UTC');
            // Add/update user skills
            if (isset($request->skills)) {
                $allSkills = Skill::all()->pluck('name')->toArray();
                $skillsToAdd = [];

                foreach ($request->skills as $skill) {
                    if (!in_array($skill, $allSkills)) {
                        $skillsToAdd[] = [
                            'name' => $skill,
                            'created_at' => $nowTime,
                            'updated_at' => $nowTime,
                        ];
                    }
                }
                $checkedSkillIds = Skill::whereIn('name', $request->skills)->pluck('id')->toArray();
                if (count($skillsToAdd) > 0) {
                    $skill = new Skill();
                    foreach ($skillsToAdd as $data) {
                        $checkedSkillIds[] = $skill->insertGetId($data);
                    }
                }
                $existingSkillsIds = UserSkill::where('user_id', $userId)->pluck('skill_id')->toArray();
                if (isset($request->skills)) {
                    foreach ($request->skills as $skill) {
                        Skill::firstOrCreate(['name' => $skill]);
                    }
                    $checkedSkillIds = Skill::whereIn('name', $request->skills)->pluck('id')->toArray();
                    $skillsToSave = array_diff($checkedSkillIds, $existingSkillsIds);
                    $skillsToDelete = array_diff($existingSkillsIds, $checkedSkillIds);
                    if (count($skillsToSave) > 0) {
                        foreach ($skillsToSave as $skillId) {
                            $userSkill = new UserSkill();
                            $userSkill->fill([
                                "skill_id" => $skillId,
                                "user_id" => $userId,
                                "date" => Carbon::parse(Carbon::now())->format('Y-m-d')
                            ]);
                            $userSkill->save();
                        }
                    }
                    if (count($skillsToDelete) > 0) {
                        UserSkill::where('user_id', $userId)->whereIn('skill_id', $skillsToDelete)->delete();
                    }
                } else {// if request skills doesn't exist but user has skills in db, we'll delete all the user skills
                    if (count($existingSkillsIds) > 0) {
                        UserSkill::where('user_id', $userId)->delete();
                    }
                }
            }
            if (!empty($request->password)) {
                $fillData['password'] = bcrypt($request->password);
            }
            if (!isset($request->status)) {
                $fillData['status'] = $user->status;
            } else {
                $fillData['status'] = $request->status;
            }
            // Add/update user soft_skills
            if (isset($request->soft_skills)) {
                $allSoftSkills = SoftSkill::all()->pluck('name')->toArray();
                $softSkillsToAdd = [];
                foreach ($request->soft_skills as $softSkill) {
                    if (!in_array($softSkill, $allSoftSkills)) {
                        $softSkillsToAdd[] = [
                            'name' => $softSkill,
                            'created_at' => $nowTime,
                            'updated_at' => $nowTime,
                        ];
                    }
                }
                $checkedSoftSkillIds = SoftSkill::whereIn('name', $request->soft_skills)->pluck('id')->toArray();
                if (count($softSkillsToAdd) > 0) {
                    $softSkill = new SoftSkill();
                    foreach ($softSkillsToAdd as $data) {
                        $checkedSoftSkillIds[] = $softSkill->insertGetId($data);
                    }
                }
                $existingSoftSkillsIds = UserSoftSkill::where('user_id', $userId)->pluck('soft_skill_id')->toArray();
                if (isset($request->soft_skills)) {
                    foreach ($request->soft_skills as $softSkill) {
                        SoftSkill::firstOrCreate(['name' => $softSkill]);
                    }

                    $checkedSoftSkillIds = SoftSkill::whereIn('name', $request->soft_skills)->pluck('id')->toArray();
                    $softSkillsToSave = array_diff($checkedSoftSkillIds, $existingSoftSkillsIds);
                    $softSkillsToDelete = array_diff($existingSoftSkillsIds, $checkedSoftSkillIds);
                    if (count($softSkillsToSave) > 0) {
                        foreach ($softSkillsToSave as $softSkillId) {
                            $userSoftSkill = new UserSoftSkill();
                            $userSoftSkill->fill([
                                "soft_skill_id" => $softSkillId,
                                "user_id" => $userId,
                                "date" => Carbon::parse(Carbon::now())->format('Y-m-d')
                            ]);
                            $userSoftSkill->save();

                        }
                    }
                    if (count($softSkillsToDelete) > 0) {
                        UserSoftSkill::where('user_id', $userId)->whereIn('soft_skill_id', $softSkillsToDelete)->delete();
                    }
                } else {// if request skills doesn't exist but user has skills in db, we'll delete all the user skills
                    if (count($existingSkillsIds) > 0) {
                        UserSoftSkill::where('user_id', $userId)->delete();
                    }
                }
            }
            if (!empty($request->password)) {
                $fillData['password'] = bcrypt($request->password);
            }
            if (!isset($request->status)) {
                $fillData['status'] = $user->status;
            } else {
                $fillData['status'] = $request->status;
            }
            // Add/update user salary
            if (isset($request->salary) && $request->salary) {
                $salary = new UserSalary();
                if ($loggedUser->can('update', $salary)) {
                    $salary->timestamps = false;
                    $newSalary = $request->salary;
                    $oldSalary = $salary->where(['user_id' => $userId, 'status' => 1])->first();
                    if (($oldSalary && $oldSalary->salary !== $newSalary) || !$oldSalary) {
                        $salary->where('user_id', $userId)->update(array(
                            'status' => 0, 'updated_at' => "'" . $nowTime . "'",
                        ));
                        $insertedSalary[] = [
                            'user_id' => $userId,
                            'salary' => $newSalary,
                            'date' => $nowTime,
                            'status' => 1,
                            'created_at' => $nowTime,
                            'updated_at' => $nowTime,
                        ];
                        $salary->insert($insertedSalary);
                    }
                }
            }

            // Add/update user bonus
            if (isset($request->bonus) && $request->bonus) {
                if ($loggedUser->can('create', new UserBonus())) {
                    $bonus = new UserBonus();
                    $lastBonus = $bonus->where('user_id', $userId)->latest()->first();
                    $lastBonusMonth = $lastBonus ? Carbon::parse($lastBonus->date)->month : false;
                    $currentMonth = $nowTime->month;

                    if ($lastBonus && $currentMonth === $lastBonusMonth) {
                        $lastBonus->bonus = $request->bonus;
                        $lastBonus->date = $nowTime;
                        $lastBonus->save();
                    } else {
                        $insertedBonus[] = [
                            'user_id' => $userId,
                            'bonus' => $request->bonus,
                            'date' => $nowTime,
                            'created_at' => $nowTime,
                            'updated_at' => $nowTime,
                        ];
                        $bonus->insert($insertedBonus);
                    }
                }
            }
            //insert/update job information
            $jobDetails = UserJobInformation::where('user_id', $user->id)->select('*')->get()->toArray();
            if (count($jobDetails)) {
                UserJobInformation::where('user_id', $user->id)->update($jobInformation);
            } else {
                UserJobInformation::insert($jobInformation);
            }

            //insert/update/delete education
            if ($editedEducations) {
                foreach ($editedEducations as $editedEducation) {
                    $editedEducation = (array)$editedEducation;
                    $validateEditEducation = Validator::make($editedEducation, [
                        'id' => 'required',
                        'education_institution' => 'required|string',
                        'another_education_institution' => 'required|string',
                        'faculty_and_department' => 'required|string',
                        'degree' => 'required|string',
                        'from' => 'required|date',
                        'to' => 'date'
                    ]);
                    if ($validateEditEducation->fails()) {
                        return response()->json(['status' => false, 'message' => $validateEditEducation->errors()]);
                    }
                    UserEducation::where('id', $editedEducation['id'])->update([
                        'education_institution' => $editedEducation['education_institution'],
                        'faculty_and_department' => $editedEducation['faculty_and_department'],
                        'profession' => $editedEducation['profession'],
                        'degree' => $editedEducation['degree'],
                        'another_education_institution' => $editedEducation['another_education_institution'],
                        'from' => $editedEducation['from'],
                        'to' => $editedEducation['to'],
                        'updated_at' => $nowTime,
                    ]);
                }
            }
            $newEducations = [];
            $education = new UserEducation();
            foreach ($addEducations as $addEducation){
                $addEducation = (array) $addEducation;
                $validateAddEducation = Validator::make($addEducation, [
                    'education_institution' => 'required|string',
                    'faculty_and_department' => 'required|string',
                    'degree' => 'required|string',
                    'another_education_institution' => 'required|string',
                    'from' => 'required|date',
                    'to' => 'date'
                ]);
                if ($validateAddEducation->fails()) {
                    return response()->json(['status' => false, 'message' => $validateAddEducation->errors()]);
                }
                $newEducations[] = [
                   'user_id' =>  $userId,
                   'education_institution' => $addEducation['education_institution'],
                   'faculty_and_department' => $addEducation['faculty_and_department'],
                   'profession' => $addEducation['profession'],
                   'degree' => $addEducation['degree'],
                   'another_education_institution' => $addEducation['another_education_institution'],
                   'from' => $addEducation['from'],
                   'to' => $addEducation['to'],
                   'created_at' => $nowTime,
                   'updated_at' => $nowTime,
                ];
            }
            $education->insert($newEducations);
            User::where('id', $user->id)->update($fillData);
            if(isset($request->notes_text)){
                $noteses = UserNote::select('*')->where('user_id', '=', $userId)->where('notes_text', '=', trim($request->notes_text))->first();
                if (!$noteses) {
                    UserNote::insert($notes);
                } else {
                    $noteses->fill($notes);
                    $noteses->save();
                }
            }

            UserEducation::whereIn('id', $deleteEducations)->delete();

            UserLanguage::where('user_id', $userId)->delete();
            $userLanguages = [];
            foreach ($request->languages as $language){
                $userLanguages[] = [
                    'user_id' => $userId,
                    'language' => $language,
                    'created_at' => $nowTime,
                    'updated_at' => $nowTime,
                ];
            }
            $newUserLanguages = new UserLanguage();
            $newUserLanguages->insert($userLanguages);
            //insert/update family  data
            $relativesDetails = UserRelative::where('user_id', $user->id)->select('*')->get()->toArray();
            if ($relativesDetails) {
                UserRelative::where('user_id', $user->id)->delete();
                UserRelative::insert($relativesDataForInsert);
            } else {
                UserRelative::insert($relativesDataForInsert);
            }

            if (User::where('id', $user->id)->update($fillData) && $userRole) {
                $user->syncRoles($userRole);
            }
            $updatedUser = User::find($user->id);
            return response()->json(['status' => true, 'message' => __('the_user_edited_successfully'), 'user' => $updatedUser]);

        }
        return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'user' => null]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function destroy(int $userId): JsonResponse
    {
        $loggedUser = auth()->user();
        if ($loggedUser->can('delete users') && $loggedUser->id != $userId) {
            $user = $this->userService->getUserById($userId);
            if (!empty($user)) {
                $data = $this->userService->deleteUser($userId);
                return response()->json(['status' => true, 'message' => __('the_user_deleted'), 'data' => $data]);
            }
            return response()->json(['status' => false, 'message' => __('user does not exist'), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __('invalid_data'), 'data' => null]);
    }

    /**
     * @param UsersAllDataRequest $request
     * @return JsonResponse
     */
    public function allData(UsersAllDataRequest $request)
    {
        $memberIds = [];
        $usersQuery = [];
        $loggedUserIsAdmin = false;
        $loggedUser = $request->user();
        if ($loggedUser->can('view users')) {
            $usersQuery = \DB::table('users')
                ->select(
                    'users.id',
                    'users.name',
                    'users.surname',
                    'users.email',
                    'users.status',
                    'users.created_at',
                    'user_job_information.work_contract',
                    'user_job_information.position as role',
                    'roles.name as role_name'
                )
                ->leftJoin('user_job_information', 'user_job_information.user_id', '=', 'users.id')
                ->leftJoin('model_has_roles', 'model_has_roles.model_id', '=', 'users.id')
                ->leftJoin('roles', 'roles.id', '=', 'model_has_roles.role_id');
            $priorityHigherRoles = $loggedUser->priorityHigherRoles();
            if (empty($priorityHigherRoles)) { // only Administrator case we have empty Higher role list
                $loggedUserIsAdmin = true;
            } else {
                $usersQuery->notRole($priorityHigherRoles);
                if ($loggedUser->hasLowestPriorityRole()) { // for staff
                    $memberIds = $loggedUser->getTeamMemberIds();
                    if (empty($memberIds)) {
                        array_push($memberIds, $loggedUser->id);
                    }
                }
            }
            $search = json_decode($request->fields);
            if (!empty($search->name)) {
                $usersQuery->where('users.name', 'LIKE', '%' . $search->name . '%');
            }
            if (!empty($search->email)) {
                $usersQuery->where('users.email', 'LIKE', '%' . $search->email . '%');
            }
            if (!empty($search->roles)) {
                $roles = !is_array($search->roles) ? [$search->roles] : $search->roles;
                if ($loggedUserIsAdmin) {
                    $allRoleIds = Role::whereIn('name', $roles)->pluck('id')->toArray();
                } else {
                    $allRoleIds = Role::where('name', '!=', Role::getHighestRoleName())->whereIn('name', $roles)->pluck('id')->toArray();
                }
                $userIdsQuery = \DB::table(config('permission.table_names.model_has_roles'))
                    ->whereIn('role_id', $allRoleIds)
                    ->where('model_type', '=', User::class);
                if (!empty($memberIds)) {
                    $userIdsQuery->whereIn('model_id', $memberIds);
                }
                $userIds = $userIdsQuery->pluck('model_id')->toArray();
                if (!empty($userIds)) {
                    $userIds = array_unique($userIds);
                    $usersQuery->whereIn('users.id', $userIds);
                }
            } else if (!empty($memberIds)) {
                $usersQuery->whereIn('id', $memberIds);
            }
            if(isset($search->status)){
                if (!!($search->status) || $search->status === '0') {
                    $statuses = !is_array($search->status) ? [$search->status] : $search->status;
                    $usersQuery->whereIn('status', $statuses);
                }
            }
            if (!empty($search->created_at)) {
                $createdAtArr = $search->created_at;
                $fromCreatedAtDate = !empty(Carbon::parse($createdAtArr[0])->format('Y-m-d')) ? Carbon::parse($createdAtArr[0])->format('Y-m-d') . ' ' . '00:00:00' : null;
                $toCreatedAtDate = !empty(Carbon::parse($createdAtArr[1])->format('Y-m-d')) ? Carbon::parse($createdAtArr[1])->format('Y-m-d') . ' ' . '23:59:59' : null;

                if ($fromCreatedAtDate && $toCreatedAtDate) {
                    $usersQuery->where('users.created_at', '>=', Carbon::parse($fromCreatedAtDate));
                    $usersQuery->where('users.created_at', '<=', Carbon::parse($toCreatedAtDate));
                } else if ($fromCreatedAtDate === null && $toCreatedAtDate) {
                    $usersQuery->where('users.created_at', '<=', $toCreatedAtDate);
                } else if ($fromCreatedAtDate && $toCreatedAtDate === null) {
                    $usersQuery->where('users.created_at', '>=', $fromCreatedAtDate);
                }
            }
        }
        return response()->json(['users' => $usersQuery->get()]);
    }

    /**
     * @param UsersAllDataRequest $request
     * @return JsonResponse|string
     */
    public function export(UsersAllDataRequest $request)
    {
        // TODO should we add permission check?
        $data = $this->allData($request);
        // download as PDF and CSV
        if ($request['type'] === 'PDF' || $request['type'] === 'CSV') {
            return $data;
        }
        $filteredData = [];
        // download as EXCEL
        foreach ($data->original['users'] as $key => $value) {
            if ($value->status === 0) {
                $status = User::INACTIVE['text'];
            } elseif ($value->status === 1) {
                $status = User::ACTIVE['text'];
            } elseif ($value->status === 2) {
                $status = User::ARCHIVED['text'];
            }
            $filteredData[] = [
                "Name" => $value->name,
                "Email" => $value->email,
                "Role" => $value->role,
                "Status" => $status,
                "Created Date" => Carbon::parse( $value->created_at)->format('Y-m-d'),
            ];
        }
        header("Content-Disposition: attachment");
        header("Content-Type: application/vnd.ms-excel");
        $chunkSize = count($filteredData) >= 0 ? 10 : count($filteredData) / (count($filteredData) / 10);
        $flag = false;
        $chunks = array_chunk($filteredData, $chunkSize, true);
        $dataForExcel = '';
        foreach ($chunks as $key => $value) {
            foreach ($value as $item) {
                if (!$flag) {
                    $dataForExcel .= implode("\t", array_keys($item)) . "\r\n";
                    $flag = true;
                }
                $dataForExcel .= implode("\t", array_values($item)) . "\r\n";
            }
        }
        return $dataForExcel;
    }

    /**
     * @param UserFullCalendarRequest $request
     * @return JsonResponse
     */
    public function fullCalendar(UserFullCalendarRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('view others full calendar')) {
            if ($loggedUser->id != $request->userId) {
                return response()->json([
                    'status' => false,
                    'message' => __('Access denied to view others full calendar'),
                ], 400);
            }
        }
        $startDateTime = Carbon::parse($request->start_date_time, $loggedUser->time_offset)->timezone(config('app.timezone'));
        $endDateTime = Carbon::parse($request->end_date_time, $loggedUser->time_offset)->timezone(config('app.timezone'));
        $events = collect([]);
        $taskEvents = [];
        if (!empty($request->view_items)) {
            if(in_array('tasks', $request->view_items)){
                $taskEvents = $this->userService->getFullCalendarData($request->userId, $startDateTime, $endDateTime, $loggedUser->time_offset);
                if (!empty($taskEvents)) $events = $events->merge($taskEvents);
            }
            if(in_array('google', $request->view_items)){
                $googleEvents = $this->userService->getFullCalendarGoogleEvents($request->userId, $startDateTime, $endDateTime, $loggedUser->time_offset);
                if (!empty($googleEvents)) $events = $events->merge($googleEvents);
            }
            if(in_array('todos', $request->view_items)){
                $todos = $this->todoService->getFullCalendarTodos($request->userId, $startDateTime, $endDateTime, $loggedUser->time_offset);
                if (!empty($todos)) $events = $events->merge($todos);
            }
            if(in_array('projects', $request->view_items)){
                if (empty($taskEvents)) { // Not any task events
                    $projectEvents = $this->userService->getFullCalendarData($request->userId, $startDateTime, $endDateTime, $loggedUser->time_offset, true);
                } else {
                    $projectEvents = $taskEvents->map(function ($item) {
                        return [
                            'event_type' => 'projects',
                            'work_id' => !empty($item['work_id']) ? $item['work_id'] : null,
                            'project_id' => !empty($item['project_id']) ? $item['project_id'] : null,
                            'project_name' => $item['project_name'],
                            'work_duration' => $item['work_duration'],
                            'work_name' => $item['work_name'],
                            'work_time_id' => $item['work_time_id'],
                            'work_user_id' => $item['work_user_id'],
                            'description' => $item['description'],
                            'title' => $item['project_name'],
                            'start' => $item['start'],
                            'end' => $item['end'],
                            'textColor' => '#ffffff', // default white
                            'backgroundColor' => config('app.calendar_projects_color'),
                            'allDay' => false,
                            'isRunning' => $item['isRunning'],
                            'tags' => $item['tags'],
                        ];
                    });
                }
                if (!empty($projectEvents)) $events = $events->merge($projectEvents);

            }
            if(in_array('tags', $request->view_items)){
                $tagEvents = $this->userService->getFullCalendarTags($request->userId, $startDateTime, $endDateTime, $loggedUser->time_offset);
                if (!empty($tagEvents)) $events = $events->merge($tagEvents);
            }
        }

        $user = $loggedUser->only(['id', 'name', 'surname', 'avatar']);
        if($loggedUser->id != $request->userId){
            $user = $this->userService->getUserForCalendarView($request->userId);
        }

        return response()->json([
            'status' => true,
            'message' => __('Success'),
            'events' => $events,
            'user' => $user
        ]);
    }

    /**
     * @param UserCasualInfoListRequest $request
     * @return JsonResponse
     */
    public function getCasualInformation(UserCasualInfoListRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        if ($loggedUser->can('view user casual')) {
            $userCasualInformation = $this->userService->getUserCasualInformation($request->id);
            return response()->json(['status' => true, 'message' => __('Success'), 'data' => $userCasualInformation]);
        }
        return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
    }


    /**
     * @param UserCasualInfoRequest $request
     * @return JsonResponse
     */
    public function createOrUpdateCasualInformation(UserCasualInfoRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        if ($loggedUser->can('add user casual') && is_null($request->input('casualId'))) {
            if ($this->userService->createUserCasualInformation($request)) {
                $userCasualInformation = $this->userService->getUserCasualInformation($request->id);
                return response()->json(['status' => true, 'message' => __('Casual Information Created Successfully'), 'data' => $userCasualInformation]);
            }
            $userCasualInformation = $this->userService->getUserCasualInformation($request->id);
            return response()->json(['status' => false, 'message' => __('Something Went Wrong'), 'data' => $userCasualInformation]);
        }
        if ($loggedUser->can('edit user casual')) {
            if ($this->userService->updateUserCasualInformation($request)) {
                $userCasualInformation = $this->userService->getUserCasualInformation($request->id);
                return response()->json(['status' => true, 'message' => __('Casual Information Updated Successfully'), 'data' => $userCasualInformation]);
            }
            $userCasualInformation = $this->userService->getUserCasualInformation($request->id);
            return response()->json(['status' => false, 'message' => __('Something Went Wrong'), 'data' => $userCasualInformation]);
        }
        return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
    }


    /**
     * @param RemoveUserCasualRequest $request
     * @return JsonResponse
     */
    public function removeCasualInformation(RemoveUserCasualRequest $request): JsonResponse
    {

        $loggedUser = auth()->user();
        $userId = (int)$request->userId;
        $casualId = (int)$request->casualId;

        if ($loggedUser->can('delete user casual')) {
            $deleteUserCasual = $this->userService->deleteUserCasualInformation($userId, $casualId);
            if ($deleteUserCasual) {
                $updatedUserCasualInformation = $this->userService->getUserCasualInformation($request->userId);
                if ($updatedUserCasualInformation) {
                    return response()->json(['status' => true, 'message' => __('Deleted successfully'), 'data' => $updatedUserCasualInformation]);
                }

            } else {
                return response()->json(['status' => false, 'message' => __("We couldn't delete"), 'data' => null]);
            }
        }
        return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
    }

    /**
     * @return JsonResponse
     */
    public function queryForNoteActiveUsers(): JsonResponse
    {
        $loggedUser = auth()->user();
        $noteForActiveUsers = $this->userService->getNoteForActiveUsers($loggedUser->id);
        if ($noteForActiveUsers) {
            return response()->json(['status' => true, 'message' => __('Success'), 'data' => $noteForActiveUsers]);
        }
        return response()->json(['status' => false, 'message' => __('Users For Note Empty'), 'data' => null]);
    }


    /**
     * @param UpdateUserEmailRequest $request
     * @return JsonResponse
     */
    public function updateUserEmail(UpdateUserEmailRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $userId = $request->input('userId');
        $isOwnerPage = (int)$loggedUser->id === (int)$userId;
        if ($loggedUser->can('edit users') || ($isOwnerPage && $loggedUser->can('edit self users'))) {
            $updateUserEmail = $this->userService->updateUserEmail($request->userId, $request->email);
            if ($updateUserEmail) {
                $updatedUserPersonalInfo = $this->getUserPersonalInfoData($request->userId);
                return response()->json(['status' => true, 'message' => __('Email update successful'), 'data' => $updatedUserPersonalInfo]);
            }
            return response()->json(['status' => false, 'message' => __('Email not updated'), 'data' => null]);
        } else {
            return response()->json(['status' => false, 'message' => __('You do not have access to edit the user')]);
        }
    }
}
