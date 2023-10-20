<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportsDetailsListRequest;
use App\Http\Requests\ReportsEffortsRequest;
use App\Http\Requests\ReportsFinancialListRequest;
use App\Http\Requests\ReportsListRequest;
use App\Http\Requests\ReportsNowWorkingOnTasksRequest;
use App\Http\Requests\ReportsProjectMemberListRequest;
use App\Http\Requests\ReportsProjectsListRequest;
use App\Http\Requests\ReportsProjectTimeListRequest;
use App\Http\Requests\ReportsProjectWorkListRequest;
use App\Http\Requests\ReportsUserReportListRequest;
use App\Models\Project;
use App\Models\Report;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\Interfaces\ProjectServiceInterface;
use App\Services\Interfaces\ReportServiceInterface;
use App\Services\Interfaces\TeamMemberServiceInterface;
use App\Services\Interfaces\UserProjectServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\Interfaces\WorkTimeTagServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    /**
     * @var ReportServiceInterface
     */
    private $reportService;

    /**
     * @var UserServiceInterface
     */
    private $userService;

    /**
     * @var ProjectServiceInterface
     */
    private $projectService;

    /**
     * @var TeamMemberServiceInterface
     */
    private $teamMemberService;

    /**
     * @var TeamMemberServiceInterface
     */
    private $workTimeTagService;

    /**
     * @var UserProjectServiceInterface
     */
    private $userProjectService;

    /**
     * ReportController constructor.
     * @param TeamMemberServiceInterface $teamMemberService
     * @param ProjectServiceInterface $projectService
     * @param ReportServiceInterface $reportService
     * @param UserServiceInterface $userService
     * @param WorkTimeTagServiceInterface $workTimeTagService
     * @param UserProjectServiceInterface $userProjectService
     */
    public function __construct(
        TeamMemberServiceInterface $teamMemberService,
        ProjectServiceInterface $projectService,
        ReportServiceInterface $reportService,
        UserServiceInterface $userService,
        WorkTimeTagServiceInterface $workTimeTagService,
        UserProjectServiceInterface $userProjectService
    )
    {
        $this->teamMemberService = $teamMemberService;
        $this->projectService = $projectService;
        $this->reportService = $reportService;
        $this->userService = $userService;
        $this->workTimeTagService = $workTimeTagService;
        $this->userProjectService = $userProjectService;
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function users(Request $request)
    {
        $items = [];
        $loggedUser = $request->user();
        if($loggedUser->can('view users')){
            $itemsQuery = User::query();
            if (!$loggedUser->can('view users for filter reports')) {
                $memberIds = $loggedUser->getTeamMemberIds();
                if (empty($memberIds)) {
                    array_push($memberIds, $loggedUser->id);
                }
                $itemsQuery->whereIn('id', $memberIds);
            }
            $items = $itemsQuery->get(['id', 'name','surname','patronymic','status'])->each(function ($user) {
                $user->setAppends([]);
            });
        }
        return response()->json(['status' => true, 'message' => __('getting_users'),'users' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function teams(Request $request)
    {
        $items = [];
        $loggedUser = $request->user();
        if($loggedUser->can('view teams')){
            $itemsQuery = Team::query();
            if (!$loggedUser->can('view teams for filter reports')) {
                $teamIds = $loggedUser->teams()->pluck('teams.id')->toArray();
                $itemsQuery->whereIn('id', $teamIds);
            }
            $items = $itemsQuery->get(['id', 'name','status']);
        }
        return response()->json(['status' => true, 'message' => __('getting_teams'), 'teams' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function projects(Request $request)
    {
        $items = [];
        $loggedUser = $request->user();
        if($loggedUser->can('view projects')){
            $itemsQuery = Project::query();
            if (!$loggedUser->can('view projects for filter reports')) {
                $projectIds = $loggedUser->allProjects()->pluck('projects.id')->toArray();
                $itemsQuery->whereIn('id', $projectIds);
            }
            $items = $itemsQuery->orderBy('name')->get(['id', 'name', 'color','status']);
        }
        return response()->json(['status' => true, 'message' => __('getting_projects'), 'projects' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  ReportsListRequest  $request
     * @return JsonResponse
     */
    public function list(ReportsListRequest $request): JsonResponse
    {
        $reports = [];
        $loggedUser = $request->user();
        $reportsForBarChart = [];
        if($loggedUser->can('view reports')){
            $filterItems = $this->_getFilterItems($request->all(), $loggedUser);
            $reports = Report::getItemsByGroupedProjects($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);
            $reportsForBarChart = Report::getItemsByGroupedForBarChart($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);
            $projectsTotalDuration = Report::getProjectsTotalDuration($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);
            $getProjectsTotalDurationForBarChart = Report::getProjectsTotalDurationForBarChart($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);
            $projectsGroupedWorksCount = Report::getProjectsGroupedWorksCount($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);

            foreach ($projectsTotalDuration as $item){
                $item->works_count = 0;
                foreach ($projectsGroupedWorksCount as $itemCount){
                    if ($item->project_id === $itemCount->project_id) {
                        $item->works_count = $itemCount->works_count;
                    }
                }
            }

            foreach ($reports as $item){
                $item->total_duration = 0;
                $item->works_count = 0;
                foreach ($projectsTotalDuration as $itemTotalDuration){
                    if ($item->project_id === $itemTotalDuration->project_id) {
                        $item->total_duration = (int)$itemTotalDuration->total_duration;
                        $item->works_count = $itemTotalDuration->works_count;
                    }
                }
            }
            foreach ($reportsForBarChart as $key => $item) {
                $item->total_duration = 0;
                $item->works_count = 0;
                if ($item->project_id === $getProjectsTotalDurationForBarChart[$key]->project_id) {
                    $item->total_duration = (int)$getProjectsTotalDurationForBarChart[$key]->total_duration;
                }
            }
        }
        return response()->json([
            'status' => true,
            'message' => __('getting_reports'),
            'reports' => $reports,
            'reportsForBarChart' => $reportsForBarChart,
        ]);
    }

    /**
     * @param ReportsProjectsListRequest $request
     * @return JsonResponse
     */
    public function projectsList(ReportsProjectsListRequest $request)
    {
        $loggedUser = $request->user();
        $filterItems = $this->_getFilterItems($request->all(), $loggedUser);
        $filterItems['selectedUserIds'] = $loggedUser->can('view projects list') ? $filterItems['selectedUserIds'] : [$loggedUser->id];
        $reports = $this->reportService->getGroupedProjects($filterItems);
        $reportsForBarChart = $this->reportService->getItemsByGroupedForBarChart($filterItems);
        $projectsTotalDuration = $this->reportService->getTotalDurationForEveryProjects($filterItems);
        $projectsGroupedMembersCount = $this->reportService->getProjectsGroupedMembersCount($filterItems);

        foreach ($projectsTotalDuration as $item) {
            $item->members_count = 0;
            foreach ($projectsGroupedMembersCount as $itemCount) {

                if ($item->project_id == $itemCount->project_id) {
                    $item->members_count = $itemCount->members_count;
                }
            }
        }
        foreach ($reports as $item) {
            $item->total_duration = 0;
            $item->members_count = 0;
            foreach ($projectsTotalDuration as $itemTotalDuration) {
                if ((int)$item->project_id === (int)$itemTotalDuration->project_id) {
                    $item->total_duration = (int)$itemTotalDuration->total_duration;
                    $item->members_count = $itemTotalDuration->members_count;
                }
            }
        }
        return response()->json([
            'status' => true,
            'message' => __('getting_reports'),
            'reports' => $reports,
            'reportsForBarChart' => $reportsForBarChart,
        ]);
    }

    /**
     * Display a listing of the resource.
     * @param  ReportsProjectWorkListRequest  $request
     * @return JsonResponse
     */
    public function projectWorkList(ReportsProjectWorkListRequest $request)
    {
        $items = [];
        $loggedUser = $request->user();
        if($loggedUser->can('view reports')){
            $filterItems = $this->_getFilterItems($request->all(), $loggedUser);
            $items = Report::getProjectGroupedWorkList($filterItems['startDateTime'], $filterItems['endDateTime'], [$request['project_id']], $filterItems['selectedUserIds']);
        }
        return response()->json([
            'status' => true,
            'message' => __('getting_reports_project_works'),
            'works' => $items
        ]);
    }

    /**
     * @param ReportsProjectMemberListRequest $request
     * @return JsonResponse
     */
    public function projectMemberList(ReportsProjectMemberListRequest $request)
    {
        $loggedUser = $request->user();
        $filterItems = $this->_getFilterItems($request->all(), $loggedUser);
        $filterItems['selectedUserIds'] = $loggedUser->can('view project member list') ? $filterItems['selectedUserIds'] : [$loggedUser->id];
        $items = $this->reportService->getProjectGroupedMemberList($filterItems);

        return response()->json([
            'status' => true,
            'message' => __('getting_reports_project_members'),
            'members' => $items['members'],
            'projectsOfUsers' => $items['projectsOfUsers']
        ]);
    }

    /**
     * @param ReportsDetailsListRequest $request
     * @return JsonResponse
     */
    public function detailsList(ReportsDetailsListRequest $request): JsonResponse
    {
        $pageSize = $request->pageSize ?? env('DEFAULT_PER_PAGE');
        $teamUsersData = $teamMembers = [];
        $projectsTotalDuration = [];
        $loggedUser = $request->user();
        if($loggedUser->can('view reports')){
            $filterItems = $this->_getFilterItems($request->all(), $loggedUser);
            $reports = Report::getItemsDetails($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);
            $teamMembers = $request->teams ? is_array($request->teams) ? TeamMember::whereIn('team_id', $request->teams)->get(['user_id', 'team_id'])->groupBy('team_id') :
                           TeamMember::where('team_id', $request->teams)->get(['user_id', 'team_id'])->groupBy('team_id') : [];
            foreach ($teamMembers as $id => $team){
                $userIds = array_column(json_decode($team, true), 'user_id');
                $teamUsersData[$id] = [];
                foreach ($reports['items'] as $item){
                    if(in_array($item->work_user_id, $userIds)){
                        $teamUsersData[$id][] = [
                            'user_id' => $item->work_user_id,
                            'user_type' => $item->work_user_type,
                            'user_salary' => $item->user_salary,
                            'start_date_time' => $item->start_date_time,
                            'end_date_time' => $item->end_date_time,
                        ];
                    };
                }
            }
            if(!empty($request['projects'])){
                $projectsTotalDuration = Report::getProjectsTotalDuration($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['projectIds'], $filterItems['selectedUserIds']);
            }
            $reports['items'] = new LengthAwarePaginator(
                collect($reports['items']),
                collect($reports['items'])->count(),
                $pageSize
            );

            return response()->json([
                'status' => true,
                'message' => __('getting_reports'),
                'reports' => $reports['items'],
                'teamUsersData' => $teamUsersData,
                'projectsTotalDuration' => $projectsTotalDuration,
                'totalDuration' => $reports['totalDuration']
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong')]);
    }

    /**
     * @param ReportsFinancialListRequest $request
     * @return JsonResponse
     */
    public function financialList(ReportsFinancialListRequest $request)
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('viewFinancialList', new Report())) {
            $reportsData = $this->getFinancialReportData($request->all(), $loggedUser);

            return response()->json([
                'status' => true,
                'message' => __('getting_financial_reports'),
                'reportProjects' => $this->paginate($reportsData)
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong')]);
    }

    /**
     * @param ReportsUserReportListRequest $request
     * @return mixed
     */
    public function userReportList(ReportsUserReportListRequest $request)
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('view reports')) {
            $filterItems = $this->getUserReportFilterItems($request->all(), $loggedUser);
            $reports = $this->reportService->getReportPerUserItems($loggedUser, $filterItems);
            $array = [];
            $projectCount = 0;
            $countTotalOfProject = $reports['projectsTotalCount'];
            foreach ($filterItems['selectedUserIds'] as $userId) {
                foreach ($countTotalOfProject as $items) {
                    if ($items->id == $userId) {
                        $projectCount++;
                    }
                    $array[$userId] = $projectCount;
                }
                $projectCount = 0;
            }
            return [
                'reports' => isset($reports['groupedByUserName']) ? $reports['groupedByUserName'] : [],
                'totalCountofProject' => $array,
                'groupedProjects' => $countTotalOfProject,
            ];
        }
        return [
            'reports' => [],
            'totalCountofProject' => [],
            'groupedProjects' => [],
        ];
    }

    /**
     * @param ReportsFinancialListRequest $request
     * @return JsonResponse
     */
    public function exportFinancialList(ReportsFinancialListRequest $request)
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('viewFinancialList')) {
            return response()->json([
                'status' => true,
                'message' => __('getting_financial_reports_for_export'),
                'reportProjects' => $this->getFinancialReportData($request->all(), $loggedUser)
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong')]);
    }

    /**
     * @param ReportsProjectTimeListRequest $request
     * @return JsonResponse
     */
    public function projectTimeList(ReportsProjectTimeListRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('view project time reports')) {
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'reports' => []]);
        }

        $filterItems = $this->_getProjectTimeFilterItems($request->validated(), $loggedUser);
        return response()->json([
            'status' => true,
            'message'=> __('Getting Project Time Reports'),
            'reports' => $this->reportService->getProjectTimeReport($filterItems)
        ]);
    }

    /**
     * @param ReportsProjectTimeListRequest $request
     * @return JsonResponse
     */
    public function projectTimeExportData(ReportsProjectTimeListRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('export project time reports')) {
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'reports' => []]);
        }

        $filterItems = $this->_getProjectTimeFilterItems($request->validated(), $loggedUser);
        return response()->json([
            'status' => true,
            'message'=> __('Getting Project Time Export Data'),
            'reports' => $this->reportService->getProjectTimeExportData($filterItems),
            'startDateTime' => substr($request['start_date_time'], 0 , 10),
            'endDateTime' => substr($request['end_date_time'], 0 , 10),
        ]);
    }

    /**
     * @param $requestData
     * @param $loggedUser
     * @return array
     */
    private function _getProjectTimeFilterItems($requestData, $loggedUser): array
    {
        $teamIds = isset($requestData['teams']) ? is_array($requestData['teams']) ? $requestData['teams'] : [$requestData['teams']] : [];
        $projectIds = isset($requestData['projects']) ? is_array($requestData['projects']) ? $requestData['projects'] : [$requestData['projects']] : [];
        $userIds = isset($requestData['users']) ? is_array($requestData['users']) ? $requestData['users'] : [$requestData['users']] : [];
        $pageSize = !empty($requestData['pageSize']) ? $requestData['pageSize'] : config('app.default_per_page');
        $page = !empty($requestData['page']) ? $requestData['page'] : 1;
//        $projectStatus = isset($requestData['status']) ? $requestData['status'] : false;
        $startDateTime = null;
        $endDateTime = null;

        if ($requestData['start_date_time']) {
            $startDateTime = Carbon::parse($requestData['start_date_time'], $loggedUser->time_offset)->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
        }
        if ($requestData['end_date_time']) {
            $endDateTime = Carbon::parse($requestData['end_date_time'], $loggedUser->time_offset)->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
        }

        if (!empty($teamIds)) {
            $teamMemberIds = $this->teamMemberService->userIdsByTeamIds($teamIds);
            $selectedUserIds = empty($userIds) ? $teamMemberIds : $userIds;
        } else { //  not filtered by team
            // Todo need to confirm about user status params
//            if (isset($requestData['status']) && !empty($userIds)) {
//                $selectedUserIds = $this->userService->getUserIdsByIdsAndStatus($userIds, $requestData['status']);
//            } else if (isset($requestData['status']) && empty($userIds)) {
//                $selectedUserIds = $this->userService->getUserIdsByStatus($requestData['status']);
//            } else {
//                $selectedUserIds = $userIds;
//            }
            $selectedUserIds = $userIds;
        }
        $selectedUserIds = array_unique($selectedUserIds);

        if (empty($selectedUserIds)) {
            if ($loggedUser->hasLowestPriorityRole(true)) { // for only staff
                $selectedUserIds = $loggedUser->getTeamMemberIds();
                if (empty($selectedUserIds)) {
                    array_push($selectedUserIds, $loggedUser->id);
                }
            } else {
                // Todo need to confirm about user status params
//                if (isset($requestData['status'])) {
//                    $selectedUserIds = $this->userService->getUserIdsByStatus($requestData['status']);
//                } else {
//                    $selectedUserIds = $this->userService->getAllUserIds();
//                }
                $selectedUserIds = $this->userService->getUserIdsByStatus(1);
            }
        }
//        if ($loggedUser->can('view user report full list') || $loggedUser->hasLowestPriorityRole(true)) {// for admin/hr || staff
//            $projectIds = $this->projectService->getAllProjectIds();
//            $projectIds[] = 0; // this means find "No Project" items too
//        } else { // for manager
//            $projectIds = $this->projectService->getProjectIdsByUserId($loggedUser->id);
//        }
        return [
            'startDateTime' => $startDateTime,
            'endDateTime' => $endDateTime,
            'projectIds' => $projectIds,
            'selectedUserIds' => $selectedUserIds,
            'page' => $page,
            'pageSize' => $pageSize
        ];
    }

    /**
     * @param $requestData
     * @param $loggedUser
     * @return array
     */
    private function getUserReportFilterItems($requestData, $loggedUser)
    {
        $teamIds = isset($requestData['teams']) ? is_array($requestData['teams']) ? $requestData['teams'] : [$requestData['teams']] : [];
        $userIds = isset($requestData['users']) ? is_array($requestData['users']) ? $requestData['users'] : [$requestData['users']] : [];
        $startDateTime = null;
        $endDateTime = null;

        if ($requestData['start_date_time']) {
            $startDateTime = Carbon::parse($requestData['start_date_time'], $loggedUser->time_offset)->timezone('UTC')->format('Y-m-d H:i:s');
        }
        if ($requestData['end_date_time']) {
            $endDateTime = Carbon::parse($requestData['end_date_time'], $loggedUser->time_offset)->timezone('UTC')->format('Y-m-d H:i:s');
        }
        if (!empty($teamIds)) {
            $teamMemberIds = $this->teamMemberService->userIdsByTeamIds($teamIds);
            $selectedUserIds = empty($userIds) ? $teamMemberIds : $userIds;
        } else { //  not filtered by team
             if (isset($requestData['status']) && !empty($userIds)) {
                 $selectedUserIds = $this->userService->getUserIdsByIdsAndStatus($userIds, $requestData['status']);
            } else if (isset($requestData['status']) && empty($userIds)) {
                 $selectedUserIds = $this->userService->getUserIdsByStatus($requestData['status']);
             } else {
                 $selectedUserIds = $userIds;
            }
        }
        $selectedUserIds = array_unique($selectedUserIds);

        if (empty($selectedUserIds)) {
            if ($loggedUser->hasLowestPriorityRole(true)) { // for only staff
                $selectedUserIds = $loggedUser->getTeamMemberIds();
                if (empty($selectedUserIds)) {
                    array_push($selectedUserIds, $loggedUser->id);
                }
            } else {
                if (isset($requestData['status'])) {
                    $selectedUserIds = $this->userService->getUserIdsByStatus($requestData['status']);
                } else {
                    $selectedUserIds = $this->userService->getAllUserIds();
                }
            }
        }
        if ($loggedUser->can('view user report full list') || $loggedUser->hasLowestPriorityRole(true)) {// for admin/hr || staff
            $projectIds = $this->projectService->getAllProjectIds();
            $projectIds[] = 0; // this means find "No Project" items too
        } else { // for manager
            $projectIds = $this->projectService->getProjectIdsByUserId($loggedUser->id);
        }
        return [
            'startDateTime' => $startDateTime,
            'endDateTime' => $endDateTime,
            'projectIds' => $projectIds,
            'selectedUserIds' => $selectedUserIds,
        ];
    }

    /**
     * @param $validatedData
     * @param $loggedUser
     * @return array
     */
    private function _getFilterItems($validatedData, $loggedUser)
    {
        $teamIds = isset($validatedData['teams']) ? is_array($validatedData['teams']) ? $validatedData['teams'] : [$validatedData['teams']] : [];
        $projectIds = isset($validatedData['projects']) ? is_array($validatedData['projects']) ? $validatedData['projects'] : [$validatedData['projects']] : [];
        $userIds = isset($validatedData['users']) ? is_array($validatedData['users']) ? $validatedData['users'] : [$validatedData['users']] : [];
        $projectStatus = isset($validatedData['status']) ? $validatedData['status'] : false;
        $projectType = isset($validatedData['type']) ? $validatedData['type'] : false;
        $startDateTime = null;
        $endDateTime = null;

        if ($validatedData['start_date_time']) {
            $startDateTime = Carbon::parse($validatedData['start_date_time'], $loggedUser->time_offset)->timezone('UTC')->format('Y-m-d H:i:s');
        }
        if ($validatedData['end_date_time']) {
            $endDateTime = Carbon::parse($validatedData['end_date_time'], $loggedUser->time_offset)->timezone('UTC')->format('Y-m-d H:i:s');
        }

        if (!empty($teamIds)) {
            $teamMemberIds = $this->teamMemberService->userIdsByTeamIds($teamIds);
            $selectedUserIds = empty($userIds) ? $teamMemberIds : $userIds;
        } else { //  not filtered by team
            $selectedUserIds = $userIds;
        }
        $selectedUserIds = array_unique($selectedUserIds);

        if (empty($selectedUserIds)) {
            if ($loggedUser->hasLowestPriorityRole(true)) { // for only staff
                $selectedUserIds = $loggedUser->getTeamMemberIds();
                if (empty($selectedUserIds)) {
                    array_push($selectedUserIds, $loggedUser->id);
                }
            } else {
                if (!empty($priorityHigherRoles)) { // only Administrator case we have empty Higher role list
                    $selectedUserIds = $this->userService->getAllUserIds();
                }
            }
        }

        if (empty($projectIds)) {
            $projectIds = $this->projectService->getAllProjectIds();
            $projectIds[] = 0; // this means find "No Project" items too
        }

        return [
            'startDateTime' => $startDateTime,
            'endDateTime' => $endDateTime,
            'projectIds' => $projectIds,
            'selectedUserIds' => $selectedUserIds,
            'projectStatus' => $projectStatus,
            'projectType' => $projectType,
        ];
    }

    /**
     * @param array $request
     * @param $loggedUser
     * @return array
     */
    private function getFinancialReportData(array $request, $loggedUser)
    {
        $filterItems = $this->_getFilterItems($request, $loggedUser);

        $reports = $this->reportService->getFinancialReportItems($filterItems);
        $reportProjects = [];

        if ($reports) {
            foreach ($reports as $projectName => $works) {
                $_item = [];
                if ($projectName) {
                    $_item['name'] = $projectName;
                    $_item['key'] = $projectName;
                    $worksObj = collect($works);
                    $worksByUserId = $worksObj->groupBy('work_user_id')->toArray();
                    if ($worksByUserId) {
                        $_item['membersCount'] = count($worksByUserId);
                        $_item['attached_users'] = [];
                        $workedHours = 0;
                        foreach ($worksByUserId as $userId => $userWorks) {
                            $attachedUser = [];
                            $attachedUser['id'] = $userId;
                            $member = $this->userService->selectUserById((int)$userId, ['*']);
                            $memberSurname = $member ? $member->surname : '';
                            if ($userWorks) {
                                $userWorkedSecondsForCurrentProject = 0;
                                foreach ($userWorks as $userWork) {
                                    $memberFullName = 'Member Name';
                                    if ($userWork->work_user_name) {
                                        $memberFullName = $userWork->work_user_name . ' ' . $memberSurname;
                                    }
                                    if (!array_key_exists('key', $attachedUser)) {
                                        $attachedUser['key'] = $userId.$userWork->work_user_name;
                                    }
                                    if (!array_key_exists('name', $attachedUser)) {
                                        $attachedUser['name'] = $memberFullName;
                                    }
                                    if (!array_key_exists('salary', $attachedUser)) {
                                        $attachedUser['salary'] = $userWork->user_salary;
                                    }
                                    if (!array_key_exists('type', $attachedUser)) {
                                        $attachedUser['type'] = $userWork->work_user_type;
                                    }
                                    if (!array_key_exists('id', $_item)) {
                                        $_item['id'] = $userWork->project_id;
                                    }
                                    if (!array_key_exists('price', $_item)) {
                                        $_item['price'] = $userWork->project_price;
                                    }
                                    if (!array_key_exists('price_currency', $_item)) {
                                        $_item['price_currency'] = $userWork->project_price_currency;
                                    }
                                    $userWorkedSecondsForCurrentProject += $userWork->duration;
                                }
                                $attachedUser['userWorkedSecondsForCurrentProject'] = $userWorkedSecondsForCurrentProject;
                                $workedHours += $userWorkedSecondsForCurrentProject;
                            }
                            array_push($_item['attached_users'], $attachedUser);
                        }
                        $_item['workedHours'] = $workedHours;
                    }
                }
                array_push($reportProjects, $_item);
            }
        }
        return $reportProjects;
    }

    /**
     * @param array $request
     * @param $loggedUser
     * @return array
     */
    private function getSummaryReportData(array $request, $loggedUser)
    {
        $filterItems = $this->_getFilterItems($request, $loggedUser);
        $reports = $this->reportService->getSummaryReportItems($filterItems);
        $reportProjects = [];
        if ($reports) {
            foreach ($reports as $projectName => $works) {
                $_item = [];
                $projectName = $projectName ? $projectName : 'No Project';
                if ($projectName) {
                    $_item['name'] = $projectName;
                    $worksObj = collect($works);
                    $worksByName = $worksObj->groupBy('work_name')->toArray();
                    if ($worksByName) {
                        $_item['projectTasks'] = [];
                        $workedHours = 0;
                        foreach ($worksByName as $workName => $userWorks) {
                            $projectTasks = [];
                            if ($userWorks) {
                                $userWorkedSecondsForCurrentWork = 0;
                                foreach ($userWorks as $userWork) {
                                    $member = $this->userService->selectUserById((int)$userWork->work_user_id, ['*']);
                                    $memberFullName = $userWork->work_user_name;
                                    if ($member) {
                                        $memberFullName .= ' ' . $member->surname;
                                    }
                                    if (!array_key_exists('userName', $projectTasks)) {
                                        $projectTasks['userName'] = $memberFullName;
                                    }
                                    if (!array_key_exists('workName', $projectTasks)) {
                                        $projectTasks['workName'] = $workName;
                                    }
                                    if (!array_key_exists('id', $_item)) {
                                        $_item['id'] = $userWork->project_id;
                                    }
                                    if (!array_key_exists('key', $_item)) {
                                        $_item['key'] = $userWork->project_id.$projectName;
                                    }
                                    $userWorkedSecondsForCurrentWork += $userWork->duration;
                                }
                                $projectTasks['userWorkedSecondsForCurrentWork'] = $userWorkedSecondsForCurrentWork;
                                $workedHours += $userWorkedSecondsForCurrentWork;
                            }
                            array_push($_item['projectTasks'], $projectTasks);
                        }
                        $_item['workedHours'] = $workedHours;
                    }
                }
                array_push($reportProjects, $_item);
            }
        }
        return $reportProjects;
    }

    /**
     * @param array $request
     * @param $loggedUser
     * @return array
     */
    private function getDetailsReportData(array $request, $loggedUser)
    {
        $filterItems = $this->_getFilterItems($request, $loggedUser);
        $reports = $this->reportService->getDetailsReportItems($filterItems);
        if ($reports) {
            foreach ($reports as $work) {
                $work->project_name = $work->project_name ? $work->project_name : 'No Project';
                $member = $this->userService->selectUserById((int)$work->work_user_id, ['*']);
                $memberFullName = $work->work_user_name;
                if ($member) {
                    $memberFullName .= ' ' . $member->surname;
                }
                $work->member_full_name = $memberFullName;
                $work->key = $work->work_time_id.$work->work_name.$work->project_name;
            }
        }
        return $reports;
    }

    /**
     * @param array $reportProjects
     * @return mixed
     */
    private function paginate(array $reportProjects) {
        $pageSize = isset($request->pageSize) ? $request->pageSize : env('DEFAULT_PER_PAGE');
        $reportProjectsObj = collect($reportProjects);
        $currentPage = LengthAwarePaginator::resolveCurrentPage() - 1;
        $currentPage = $currentPage < 0 ? 1 : $currentPage;
        $currentPageSearchResults = $reportProjectsObj->slice($currentPage * $pageSize, $pageSize)->values()->all();

        return new LengthAwarePaginator(
            collect($currentPageSearchResults),
            $reportProjectsObj->count(),
            $pageSize
        );
    }

    /**
     * @param ReportsFinancialListRequest $request
     * @return JsonResponse
     */
    public function exportSummaryList(ReportsFinancialListRequest $request)
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('view reports')) {
            return response()->json([
                'status' => true,
                'message' => __('getting_summary_reports_for_export'),
                'reportProjects' => $this->getSummaryReportData($request->all(), $loggedUser)
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong')]);
    }

    /**
     * @param ReportsFinancialListRequest $request
     * @return JsonResponse
     */
    public function exportDetailsList(ReportsFinancialListRequest $request)
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('view reports')) {
            return response()->json([
                'status' => true,
                'message' => __('getting_details_reports_for_export'),
                'reportProjects' => $this->getDetailsReportData($request->all(), $loggedUser)
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong')]);
    }

    /**
     * @param ReportsEffortsRequest $request
     * @return JsonResponse
     */
    public function efforts(ReportsEffortsRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        $reqTeamsProjects = $this->_getTeamAndProjectIds($request);
        $teamIds = $loggedUser->getTeamIds();
        $projectIds = $loggedUser->getProjectIds();
        if (!empty($reqTeamsProjects['teamIds'])) {
            $teamIds = array_values(array_intersect($reqTeamsProjects['teamIds'], $teamIds));
            $request->merge(['teams' => $teamIds]);
        }
        if (!empty($reqTeamsProjects['projectIds'])) {
            $projectIds = array_values(array_intersect($reqTeamsProjects['projectIds'], $projectIds));
            $request->merge(['projects' => $projectIds]);
        }
        if (!$loggedUser->can('view efforts', ['checkTeamsProjects', ['teamIds' => $teamIds, 'projectIds' => $projectIds]])) {
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'reports' => []]);
        }

        $filterItems = $this->_getReportsFilters($request->validated(), $loggedUser);
        $reportsQuery = $this->reportService->getEfforts($filterItems);

        if (!$filterItems['isExport']) {
            $reports = $reportsQuery->paginate((int)$filterItems['pageSize'], ['*'], 'page', (int)$filterItems['page']);
        } else { // need data for export
            $reports = $reportsQuery->get();
        }
        $workUserIds = $reports->pluck('work_user_id')->unique()->toArray();

        $clientFilters = $filterItems;
        $clientFilters['selectedUserIds'] = $workUserIds; // important
        $clientHours = $this->reportService->getClientHours($clientFilters);

        $projectIds = $reports->pluck('project_id')->unique()->filter(function($projectId) {
            return !empty($projectId);
        })->toArray();
        $userProjects = [];
        if (!empty($projectIds)) {
            $userProjects = $this->userProjectService->getItemsByProjectIdsAndDateRange($projectIds, $filterItems['startDateTime'], $filterItems['endDateTime']);
        }

        foreach ($reports as $report) {
            $report->rate = null;
            $report->rate_currency = null;
            $report->user_project_start_date = null;
            $report->user_project_end_date = null;
            $report->reported_time = null;
            $report->user_project_role_name = null;

            if (empty($report->project_id)) continue;

            foreach ($clientHours as $clientHour) {
                if ($clientHour->user_id === $report->work_user_id
                    && $clientHour->project_id === $report->project_id
                    && $clientHour->date === $report->start_date
                ) {
                    $report->reported_time = (int)$clientHour->reported_time;
                }
            }

            foreach ($userProjects as $userProject){
                if ($userProject->project_id === $report->project_id
                    && $userProject->user_id === $report->work_user_id) {

                    $report->rate = $userProject->rate;
                    $report->rate_currency = $userProject->rate_currency;
                    $report->user_project_start_date = $userProject->start_date;
                    $report->user_project_end_date = $userProject->end_date;
                    $report->user_project_role_name = $userProject->user_project_role_name;
                }

            }
        }

        return response()->json(
            [
                'status' => true,
                'message' => __('getting_efforts'),
                'reports' => $reports,
            ]
        );
    }

    /**
     * Display a listing of the resource.
     * @param ReportsNowWorkingOnTasksRequest $request
     * @return JsonResponse
     */
    public function nowWorkingOnTasks(ReportsNowWorkingOnTasksRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        $reqTeamsProjects = $this->_getTeamAndProjectIds($request);
        $teamIds = $loggedUser->getTeamIds();
        $projectIds = $loggedUser->getProjectIds();
        if (!empty($reqTeamsProjects['teamIds'])) {
            $teamIds = array_values(array_intersect($reqTeamsProjects['teamIds'], $teamIds));
            $request->merge(['teams' => $teamIds]);
        }
        if (!empty($reqTeamsProjects['projectIds'])) {
            $projectIds = array_values(array_intersect($reqTeamsProjects['projectIds'], $projectIds));
            $request->merge(['projects' => $projectIds]);
        }
        if (!$loggedUser->can('view now working on tasks', ['checkTeamsProjects', ['teamIds' => $teamIds, 'projectIds' => $projectIds]])) {
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'reports' => []]);
        }

        $filterItems = $this->_getNowWorkingOnFilterItems($request->validated(), $loggedUser);
        $reports = $this->reportService->getNowWorkingOnReport($filterItems);
        // Getting tags
        $today = Carbon::today($loggedUser->time_offset);
        $startDateTime = $today->format('Y-m-d 00:00:00');
        $endDateTime = $today->format('Y-m-d 23:59:59');
        $workTimesIds = $reports->pluck('work_time_id')->toArray();
        $workTimeTags = $this->workTimeTagService->getTagsByWorkTimeIdsAndStartEndDateTime($workTimesIds, $startDateTime, $endDateTime);
        return response()->json(
            [
                'status' => true,
                'message' => __('getting_works'),
                'reports' => $reports,
                'workTimeTags' => $workTimeTags,
            ]
        );
    }

    /**
     * @param $requestData
     * @param $loggedUser
     * @return array
     */
    private function _getNowWorkingOnFilterItems($requestData, $loggedUser): array
    {
        $teamIds = isset($requestData['teams']) ? is_array($requestData['teams']) ? $requestData['teams'] : [$requestData['teams']] : [];
        $projectIds = isset($requestData['projects']) ? is_array($requestData['projects']) ? $requestData['projects'] : [$requestData['projects']] : [];
        $userIds = isset($requestData['users']) ? is_array($requestData['users']) ? $requestData['users'] : [$requestData['users']] : [];
        $pageSize = !empty($requestData['pageSize']) ? $requestData['pageSize'] : config('app.default_per_page');
        $page = !empty($requestData['page']) ? $requestData['page'] : 1;

        if (!empty($teamIds)) {
            $teamMemberIds = $this->teamMemberService->userIdsByTeamIds($teamIds);
            $selectedUserIds = empty($userIds) ? $teamMemberIds : array_values(array_intersect($teamMemberIds, $userIds));
        } else { //  not filtered by team
            $selectedUserIds = $userIds;
        }

        $projectIds = array_unique($projectIds);
        $selectedUserIds = array_unique($selectedUserIds);

        $isTeamIdsOrUserIdsExist = !empty($teamIds) || !empty($userIds);
        if (empty($selectedUserIds) && !$isTeamIdsOrUserIdsExist) {
            if ($loggedUser->hasLowestPriorityRole(true)) { // for only staff
                $selectedUserIds = $loggedUser->getTeamMemberIds();
                if (empty($selectedUserIds)) {
                    array_push($selectedUserIds, $loggedUser->id);
                }
            } else {
                $selectedUserIds = $this->userService->getUserIdsByStatus(1);
            }
        }

        return [
            'projectIds' => $projectIds,
            'selectedUserIds' => $selectedUserIds,
            'page' => $page,
            'pageSize' => $pageSize
        ];
    }

    /**
     * @param $request
     * @return array
     */
    private function _getTeamAndProjectIds($request): array
    {
        $teamIds = [];
        if (!empty($request->teams)) {
            $teamIds = is_array($request->teams) ? $request->teams : [$request->teams];
        }
        $projectIds = [];
        if (!empty($request->projects)) {
            $projectIds = is_array($request->projects) ? $request->projects : [$request->projects];
        }
        return ['teamIds' => $teamIds, 'projectIds' => $projectIds];
    }

    /**
     * @param array $validatedData
     * @param $loggedUser
     * @return array
     */
    private function _getReportsFilters(array $validatedData, $loggedUser): array
    {
        $teamIds = isset($validatedData['teams']) ? is_array($validatedData['teams']) ? $validatedData['teams'] : [$validatedData['teams']] : [];
        $projectIds = isset($validatedData['projects']) ? is_array($validatedData['projects']) ? $validatedData['projects'] : [$validatedData['projects']] : [];
        $userIds = isset($validatedData['users']) ? is_array($validatedData['users']) ? $validatedData['users'] : [$validatedData['users']] : [];
        $pageSize = !empty($validatedData['pageSize']) ? $validatedData['pageSize'] : config('app.default_per_page');
        $page = !empty($validatedData['page']) ? $validatedData['page'] : 1;
        $projectStatus = $validatedData['status'] ?? null;
        $projectType = $validatedData['type'] ?? null;
        $startDateTime = null;
        $endDateTime = null;

        if ($validatedData['start_date_time']) {
            $startDateTime = Carbon::parse($validatedData['start_date_time'], $loggedUser->time_offset)->timezone('UTC')->format('Y-m-d H:i:s');
        }
        if ($validatedData['end_date_time']) {
            $endDateTime = Carbon::parse($validatedData['end_date_time'], $loggedUser->time_offset)->timezone('UTC')->format('Y-m-d H:i:s');
        }

        if (!empty($teamIds)) {
            $teamMemberIds = $this->teamMemberService->userIdsByTeamIds($teamIds);
            $selectedUserIds = empty($userIds) ? $teamMemberIds : array_values(array_intersect($teamMemberIds, $userIds));
        } else { //  not filtered by team
            $selectedUserIds = $userIds;
        }

        $projectIds = array_unique($projectIds);
        $selectedUserIds = array_unique($selectedUserIds);

        $isTeamIdsOrUserIdsExist = !empty($teamIds) || !empty($userIds);
        if (empty($selectedUserIds) && !$isTeamIdsOrUserIdsExist) {
            if ($loggedUser->hasLowestPriorityRole(true)) { // for only staff
                $selectedUserIds = $loggedUser->getTeamMemberIds();
                if (empty($selectedUserIds)) {
                    array_push($selectedUserIds, $loggedUser->id);
                }
            } else {
                $selectedUserIds = $this->userService->getUserIdsByStatus(1);
            }
        }

        return [
            'projectIds' => $projectIds,
            'selectedUserIds' => $selectedUserIds,
            'page' => $page,
            'pageSize' => $pageSize,
            'startDateTime' => $startDateTime,
            'endDateTime' => $endDateTime,
            'projectStatus' => $projectStatus,
            'projectType' => $projectType,
            'isExport' => $validatedData['isExport'] ?? 0,
        ];
    }
}
