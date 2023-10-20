<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamsListRequest;
use App\Http\Requests\TeamsStoreRequest;
use App\Http\Requests\TeamsUpdateRequest;
use App\Models\Team;
use App\Models\User;
use App\Models\TeamMember;
use App\Models\TeamMemberRole;
use App\Services\Interfaces\TeamMemberRoleServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\Interfaces\TeamServiceInterface;
use App\Services\Interfaces\TeamMemberServiceInterface;
use App\Services\Interfaces\ProjectServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamsController extends Controller
{
    /**
     * @var UserServiceInterface
     */
    private $userService;

    /**
     * @var TeamServiceInterface
     */
    private $teamService;

    /**
     * @var TeamMemberServiceInterface
     */
    private $teamMemberService;

    /**
     * @var TeamMemberRoleServiceInterface
     */
    private $teamMemberRoleService;

    /**
     * @var ProjectServiceInterface
     */
    private $projectService;

    /**
     * ApiAuthController constructor.
     * @param UserServiceInterface $userService
     * @param TeamServiceInterface $teamService
     * @param ProjectServiceInterface $projectService
     * @param TeamMemberServiceInterface $teamMemberService
     * @param TeamMemberRoleServiceInterface $teamMemberRoleService
     */
    public function __construct(
        UserServiceInterface $userService,
        TeamServiceInterface $teamService,
        ProjectServiceInterface $projectService,
        TeamMemberServiceInterface $teamMemberService,
        TeamMemberRoleServiceInterface $teamMemberRoleService
    )
    {
        $this->userService = $userService;
        $this->teamService = $teamService;
        $this->projectService = $projectService;
        $this->teamMemberService = $teamMemberService;
        $this->teamMemberRoleService = $teamMemberRoleService;
    }
    /**
     * Display a listing of the resource.
     * @param  TeamsListRequest  $request
     * @return JsonResponse
     */
    public function list(TeamsListRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $items = [];
        if ($request->user()->can('view teams')) {
            $items = $this->teamService->list($request);
        } elseif ($request->user()->can('view self teams')) {
            $teamIds = $loggedUser->teams->pluck('id')->all();
            if(!empty($teamIds)){
                $items = $this->teamService->list($request, $teamIds);
            }
        }
        return response()->json(['status' => true, 'message' => __('getting_teams'), 'teams' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function users(Request $request): JsonResponse
    {
        $items = [];
        // TODO: Add "assign user to team" permission
        if($request->user()->can('view users')){
            $items = $this->userService->activeUsersWithTeams();
        }

        return response()->json(['status' => true, 'message' => __('getting_users_with_teams'), 'users' => $items]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function projects(Request $request): JsonResponse
    {
        $projects = [];
        // TODO: Add "assign project to team" permission
        if ($request->user()->can('view projects')) {
            $projects = $this->projectService->activeProjects();
        }
        return response()->json(['status' => true, 'message' => __('getting_all_projects_for_teams'), 'projects' => $projects]);
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  TeamsStoreRequest  $request
     * @return JsonResponse
     */
    public function store(TeamsStoreRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        if($loggedUser->can('create', Team::class)) // Here is working the TeamPolicy
        {
            if (!in_array($request['status'], [Team::INACTIVE, Team::ACTIVE, Team::ARCHIVED])) {
                return response()->json(['status' => false, 'message' => __('Invalid Team status'), 'team' => null]);
            }

            $item = $this->teamService->add([
                "name" => $request['name'],
                "description" => isset($request['description']) ? $request['description'] : null,
                "status" => $request['status'],
                "user_id" => $loggedUser->id,
            ]);

            if (isset($item->id)) {
                $this->addTeamMembers($request['members'], $item->id);

                $team_has_projects = [];
                foreach ($request['project_id'] as $project) {
                    $team_has_projects[] = [
                        "team_id" => $item->id,
                        "project_id" => $project,
                    ];
                }

                if (!empty($team_has_projects)) {
                    \DB::table('team_has_projects')->insertOrIgnore($team_has_projects);
                }
//                else { // TODO should we show this case ?
//                    return response()->json(['status' => false, 'message' => __('invalid_user_roles'), 'user' => null]);
//                }
                $data = Team::where('id', $item->id)->with('members')->first();
                return response()->json(['status' => true, 'message' => __('The Team added successfully'), 'data' => $data]);
            }
            return response()->json(['status' => false, 'message' => __('Something went wrong'), 'data' => null]);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $teamId
     * @return mixed
     */
    public function show(int $teamId)
    {
        // TODO should we add permission check?
        $loggedUser = auth()->user();
        if (!$loggedUser->can('view team details') && !$loggedUser->can('view self team details')) {
            return response()->json(['status' => false, 'message' => __('Access Denied'), 'data' => null]);
        }
        $teamMembers = $this->teamService->teamByIdWithMembersProjects($teamId);
        $userIds = $this->teamMemberService->userIdsByTeamId($teamId);
        //today
        $todayStartDateTime = Carbon::now()->startOfDay()->setTimezone($loggedUser->timezone)->toDateTimeString();
        $todayEndDateTime = Carbon::now()->startOfDay()->copy()->endOfDay()->setTimezone($loggedUser->timezone)->toDateTimeString();
        //month
        $monthStartDate = Carbon::now()->firstOfMonth()->copy()->endOfMonth()->setTimezone($loggedUser->timezone)->toDateTimeString();
        $monthEndDate = Carbon::now()->firstOfMonth()->setTimezone($loggedUser->timezone)->toDateTimeString();
        //week
        $weekStartDate = Carbon::now()->startOfWeek()->setTimezone($loggedUser->timezone)->toDateTimeString();
        $weekEndDate = Carbon::now()->startOfWeek()->copy()->endOfWeek()->setTimezone($loggedUser->timezone)->toDateTimeString();

        $durationForToday = $this->teamService->userWorkDurations($userIds, $todayStartDateTime, $todayEndDateTime);
        $durationForMonth = $this->teamService->userWorkDurations($userIds, $monthEndDate, $monthStartDate);
        $durationForWeek = $this->teamService->userWorkDurations($userIds, $weekStartDate, $weekEndDate);

        $todayDuration = [];
        foreach ($durationForToday as $item) {
            $todayDuration[$item->work_user_id] = $item->total_duration;
        }

        $weekDuration = [];
        foreach ($durationForWeek as $item) {
            $weekDuration[$item->work_user_id] = $item->total_duration;
        }

        $monthDuration = [];
        foreach ($durationForMonth as $item) {
            $monthDuration[$item->work_user_id] = $item->total_duration;
        }

        $isSelfTeam = false;
        foreach ($teamMembers['members'] as $k => $member) {
            $totalDuration = $this->teamService->teamMemberWorkDuration($member->id);
            $teamMembers['members'][$k]['todayDuration'] = isset($todayDuration[$member->id]) ? (int)$todayDuration[$member->id] : 0;
            $teamMembers['members'][$k]['weekDuration'] = isset($weekDuration[$member->id]) ? (int)$weekDuration[$member->id] : 0;
            $teamMembers['members'][$k]['monthDuration'] = isset($monthDuration[$member->id]) ? (int)$monthDuration[$member->id] : 0;
            $teamMembers['members'][$k]['totalDuration'] = $totalDuration->total_duration ? (int)$totalDuration->total_duration : 0;
            if ($loggedUser->id === $member->id) {
                $isSelfTeam = true;
            }
        }
        if ($loggedUser->can('view team details') || ($isSelfTeam && $loggedUser->can('view self team details'))) {
            return $teamMembers;
        }
        return [];
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  TeamsUpdateRequest  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(TeamsUpdateRequest $request, int $id): JsonResponse
    {
        $loggedUser = auth()->user();
        $item = $this->teamService->find($id);
        if (empty($item)) {
            return response()->json(['status' => false, 'message' => __('Invalid Team'), 'data' => null]);
        }
        if ($loggedUser->can('update', $item)) { // TODO should we add permission check? Maybe should be update teams?
            $updated = $this->teamService->edit([
                "name" => $request['name'],
                "description" => $request['description'],
                "status" => $request['status'],
            ], $id);

            if ($updated) {
                $this->teamMemberService->deleteByTeamId($id); // todo removing all team members, maybe need to keep members and add/remove
                $this->addTeamMembers($request['members'], $id);

                $team_has_projects = [];
                foreach ($request['project_id'] as $project) {
                    $team_has_projects[] = [
                        "team_id" => $id,
                        "project_id" => $project,
                    ];
                }
                \DB::table('team_has_projects')->where('team_id', '=', $id)->delete();
                \DB::table('team_has_projects')->insertOrIgnore($team_has_projects);

                $data = $this->teamService->getTeamById($id);
                return response()->json(['status' => true, 'message' => __('The Team edited successfully'), 'data' => $data]);
            }

            return response()->json(['status' => false, 'message' => __('Something went wrong'), 'data' => null]);
        }
        return response()->json(['status' => false, 'message' => __('You have no permissions to edit teams')]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     * @throws \Exception
     */
    public function destroy(int $id): JsonResponse
    {
        $item = $this->teamService->find($id);
        // TODO should we add permission check? Maybe should be update teams?
        if(auth()->user()->can('delete', $item))
        {
            return response()->json(['status' => true, 'message' => __('The Team deleted'), 'data' => $this->teamService->delete($id)]);
        }
        return response()->json(['status' => false, 'message' => __('Invalid data'), 'data' => null]);
    }

    /**
     * Get team member roles name
     *
     * @return JsonResponse
     */
    public function memberRoles(): JsonResponse
    {
        return response()->json(['status' => true, 'message' => __('The Member List  Received Successfully'), 'roleIdNameList' => TeamMemberRole::select('id','name')->get()]);
    }

    /**
     * Change Team Status.
     * @param Request $request
     * @return JsonResponse
     */
    public function changeTeamStatus(Request $request): JsonResponse
    {
        $id = $request->id;
        $status = $request->status;
        $item = $this->teamService->find($id);

        if(auth()->user()->can('update', $item))
        {
            $isUpdated = $this->teamService->updateTeamStatus($id, $status);
            if ($isUpdated) {
                return response()->json(['status' => true, 'message' => __('The Team status updated'), 'data' => ['id' => $id]]);
            } else {
                return response()->json(['status' => true, 'message' => __('Something went wrong'), 'data' => null]);
            }
        }
        return response()->json(['status' => false, 'message' => __('Invalid data'), 'data' => null]);

    }

    /**
     * @param $members
     * @param $teamId
     * @return void|bool
     */
    private function addTeamMembers($members, $teamId): ?bool
    {
        // no need to do anything if we have empty/not array data for members
        if (empty($members) || !is_array($members)) return false;

        $bulkInsertData = [];
        $nowTime = Carbon::now();
        $teamMemberRoles = $this->teamMemberRoleService->all()->pluck('name', 'id')->toArray();
        $roleNames = array_values($teamMemberRoles);
        $newCreatedRoles = [];
        foreach ($members as $member) {
            $member = (array)$member;
            if (empty($member['role_name'])) continue; // ignoring empty role name members

            if (!empty($roleNames) && in_array($member['role_name'], $roleNames)) {
                $teamMemberRoleId = array_search($member['role_name'], $teamMemberRoles); // Important
                $bulkInsertData[] = [
                    "team_id" => $teamId,
                    "user_id" => $member['user_id'],
                    "team_member_role_id" =>$teamMemberRoleId,
                    "created_at" => $nowTime,
                    "updated_at" => $nowTime,
                ];
            } else { // Creating new role
                $teamMemberRoleId = null;
                if (!in_array($member['role_name'], $newCreatedRoles)) {
                    $teamMemberRole = $this->teamMemberRoleService->add([
                        "name" => $member['role_name'],
                        "created_at" =>$nowTime,
                        "updated_at" =>$nowTime,
                    ]);
                    if (isset($teamMemberRole->id)) {
                        $teamMemberRoleId = $teamMemberRole->id;
                        $newCreatedRoles[$teamMemberRoleId] = $member['role_name'];
                    }
                } else {
                    $teamMemberRoleId = array_search($member['role_name'], $newCreatedRoles); // Important
                }

                if (!empty($teamMemberRoleId)) {
                    $bulkInsertData[] = [
                        "team_id" => $teamId,
                        "user_id" => $member['user_id'],
                        "team_member_role_id" => $teamMemberRoleId,
                        "created_at" => $nowTime,
                        "updated_at" => $nowTime,
                    ];
                }
            }
        }
        if (!empty($bulkInsertData)) {
//                    foreach (array_chunk($bulkInsertData, 1000) as $bulkInsert) { // todo for big data
            TeamMember::insert($bulkInsertData);
//                    }
        }
        return true;
    }


    /**
     * @param TeamsListRequest $request
     * @return JsonResponse
     */
    public function export(TeamsListRequest $request): JsonResponse
    {
        $teams = $this->teamService->getTeamsForExport($request);
        return response()->json(['status' => true, 'message' => __('The Team get success'), 'data' => $teams]);
    }
}
