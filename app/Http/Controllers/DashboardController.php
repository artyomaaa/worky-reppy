<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardReportListRequest;
use App\Http\Requests\WeeklyActivityRequest;
use App\Models\Dashboard;
use App\Services\Interfaces\DashboardServiceInterface;
use App\Services\Interfaces\ProjectServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\Interfaces\UserWorkHistoryServiceInterface;

class DashboardController extends Controller
{

    /**
     * @var UserWorkHistoryServiceInterface
     */
    private $userWorkHistoryService;

    /**
     * @var DashboardServiceInterface
     */
    private $dashboardService;

    /**
     * @var ProjectServiceInterface
     */
    private $projectService;

    /**
     * DashboardController constructor.
     * @param UserWorkHistoryServiceInterface $userWorkHistoryService
     * @param DashboardServiceInterface $dashboardService
     * @param ProjectServiceInterface $projectService
     */
    public function __construct(
        UserWorkHistoryServiceInterface $userWorkHistoryService,
        DashboardServiceInterface $dashboardService,
        ProjectServiceInterface $projectService
    )
    {
        $this->userWorkHistoryService = $userWorkHistoryService;
        $this->dashboardService = $dashboardService;
        $this->projectService = $projectService;
    }

    private function _getFilterItems($validatedData, $loggedUser): array
    {
        $teamMember = isset($validatedData['teamMember']) ? is_array($validatedData['teamMember']) ? $validatedData['teamMember'] : [$validatedData['teamMember']] : [];
        $userIds = isset($validatedData['users']) ? is_array($validatedData['users']) ? $validatedData['users'] : [$validatedData['users']] : [];
        $projectIds = isset($validatedData['projectIds']) ? is_array($validatedData['projectIds']) ? $validatedData['projectIds'] : [$validatedData['projectIds']] : [];

        $startDateTime = !empty($validatedData['start_date_time']) ? $validatedData['start_date_time'] : null;
        $endDateTime = !empty($validatedData['end_date_time']) ? $validatedData['end_date_time'] : null;

        if (!empty($teamMember)) {
            $teamMemberIds = $loggedUser->getTeamMemberIds();
            $selectedUserIds = array_merge($teamMemberIds, $userIds);
        } else { //  not filtered by team
            $selectedUserIds = $userIds;
        }
        $selectedUserIds = array_unique($selectedUserIds);

        return [
            'startDateTime' => $startDateTime,
            'endDateTime' => $endDateTime,
            'selectedUserIds' => $selectedUserIds,
            'projectIds' => $projectIds,
        ];
    }

    /**
     * Get report list
     * @param DashboardReportListRequest $request
     * @return JsonResponse
     */
    public function reportList(DashboardReportListRequest $request): JsonResponse
    {
        // TODO should we add permission check?
        $loggedUser = $request->user();
        $filterItems = $this->_getFilterItems($request->all(), $loggedUser);

        //this foreach is needed to filter by project so that we can show those tasks that are not in the project
        $projectIds = [];
        foreach ($filterItems['projectIds'] as $projectId) {
            if ($projectId == 0) {
                $projectId = null;
            }
            $projectIds[] = $projectId;
        }
        $reportsData = $this->dashboardService->getItemsByGroupedProjects($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['selectedUserIds'], $projectIds);
        $forBarChart = $this->dashboardService->getItemsForBarChart($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['selectedUserIds'], $projectIds);
        $reports = $reportsData['items'];
        $reportsForBarChart = $forBarChart['items'];

        $projectsTotalDuration = $this->dashboardService->getProjectsTotalDuration($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['selectedUserIds'], $projectIds);
        $datesDuration = $this->dashboardService->getDurationDatas($filterItems['startDateTime'], $filterItems['endDateTime'], $filterItems['selectedUserIds'], $projectIds);
        foreach ($reports as $item) {
            $item->total_duration = 0;
            foreach ($projectsTotalDuration as $itemTotalDuration) {
                if ($item->project_id === $itemTotalDuration->project_id) {
                    $item->total_duration = (int)$itemTotalDuration->total_duration;
                }
            }
        }
        foreach ($reportsForBarChart as $key => $item) {
            $item->total_duration = 0;
            if ($item->project_id === $datesDuration[$key]->project_id) {
                $item->total_duration = $datesDuration[$key]->duration;
            }
        }

        return response()->json([
            'status' => true,
            'message' => __('getting_reports'),
            'reports' => $reports,
            'reportsForBarChart' => $reportsForBarChart,
            'totalDuration' => $reportsData['totalDuration']
        ]);
    }
    public function mostTracked($userId) {
        // TODO should we add permission check?
        $items = Dashboard::getMostTrackedWorks($userId);

        return response()->json([
            'status' => true,
            'message' => __('getting_works'),
            'mostTracked' => $items,
        ]);
    }
    public function activities(Request $request) {
        // TODO should we add permission check?
        $loggedUser = $request->user();
        $filterItems = $this->_getFilterItems($request->all(), $loggedUser);

        $activities = Dashboard::getActivities($filterItems['selectedUserIds']);
        return response()->json([
            'status' => true,
            'message' => __('getting_activities'),
            'activities' => $activities,
        ]);
    }

    /**
     * @param WeeklyActivityRequest $request
     * @return JsonResponse
     */
    public function weeklyActivity(WeeklyActivityRequest $request): JsonResponse
    {
        // TODO should we add permission check?
        $loggedUser = $request->user();
        if ($loggedUser->can('view self weekly activity')) {
            $weeklyActivityData = $this->userWorkHistoryService->getWeeklyActivityData($loggedUser->id);
            return response()->json([
                'status' => true,
                'message' => __('getting_weekly_activity_data'),
                'weeklyActivities' => $weeklyActivityData,
            ]);
        }
        return response()->json(['status' => false, 'message' => __('access_denied'), 'data' => null]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserProjects(Request $request): JsonResponse
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('view projects')) {
            $itemsQuery = $this->projectService->getAllProjectsQuery();
        } else {
            $projectsIds = collect($loggedUser->projects)->pluck('id')->all();
            $itemsQuery = $this->projectService->getUserAttachedProjectsQuery($projectsIds);
        }
        $items = $itemsQuery->get(['id', 'name', 'color']);
        return response()->json([
            'status' => true,
            'message' => __('getting logged user projects'),
            'userAttachedProjects' => $items
        ]);

    }
}
