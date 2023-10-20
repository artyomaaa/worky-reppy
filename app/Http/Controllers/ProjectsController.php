<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectsDeleteRequest;
use App\Http\Requests\ProjectsListRequest;
use App\Http\Requests\ProjectsRemoveMemberHistoryRequest;
use App\Http\Requests\ProjectsStoreRequest;
use App\Http\Requests\ProjectsUnassignedMemberRequest;
use App\Http\Requests\ProjectsUpdateMemberHistoryRequest;
use App\Http\Requests\ProjectsUpdateRequest;
use App\Services\Interfaces\ProjectServiceInterface;
use App\Services\Interfaces\ProjectTechnologyServiceInterface;
use App\Services\Interfaces\TechnologyServiceInterface;
use App\Services\Interfaces\UserProjectRoleServiceInterface;
use App\Services\Interfaces\UserProjectServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Project;


class ProjectsController extends Controller
{
    /**
     * @var ProjectServiceInterface
     */
    private $projectService;

    /**
     * @var UserServiceInterface
     */
    private $userService;

    /**
     * @var UserProjectServiceInterface
     */
    private $userProjectService;

    /**
     * @var TechnologyServiceInterface
     */
    private $technologyService;

    /**
     * @var ProjectTechnologyServiceInterface
     */
    private $projectTechnologyService;


    /**
     * @var UserProjectRoleServiceInterface
     */
    private $userProjectRoleService;

    /**
     * ProjectsController constructor.
     * @param ProjectServiceInterface $projectService
     * @param UserServiceInterface $userService
     * @param UserProjectServiceInterface $userProjectService
     * @param UserProjectRoleServiceInterface $userProjectRoleService
     * @param TechnologyServiceInterface $technologyService
     * @param ProjectTechnologyServiceInterface $projectTechnologyService
     */
    public function __construct(
        ProjectServiceInterface $projectService,
        UserServiceInterface $userService,
        UserProjectServiceInterface $userProjectService,
        UserProjectRoleServiceInterface $userProjectRoleService,
        TechnologyServiceInterface $technologyService,
        ProjectTechnologyServiceInterface $projectTechnologyService
    )
    {
        $this->projectService = $projectService;
        $this->userService = $userService;
        $this->userProjectService = $userProjectService;
        $this->userProjectRoleService = $userProjectRoleService;
        $this->technologyService = $technologyService;
        $this->projectTechnologyService = $projectTechnologyService;
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function users(Request $request): JsonResponse
    {
        $items = [];
        if($request->user()->can('view projects')){
            $items = $this->userService->getUsers(['id', 'name', 'surname', 'avatar', \DB::raw('CONCAT(name," ",surname) AS full_name'), 'status']);
        }
        return response()->json(['status' => true, 'message' => __('getting_active_users'), 'users' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function userRoles(Request $request): JsonResponse
    {
        $items = [];
        if($request->user()->can('view projects')){
            $_items = $this->userProjectRoleService->all();
            $items = [];
            if (count($_items) > 0) {
                foreach ($_items as $_item) {
                    $items[] = ['id' => $_item->id, 'name' => $_item->name];
                }
            }
        }
        return response()->json(['status' => true, 'message' => __('getting_user_project_roles'), 'userProjectRoles' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function technologies(Request $request): JsonResponse
    {
        $items = [];
        if($request->user()->can('view projects')){
            $_items = $this->technologyService->all();
            $items = [];
            if (count($_items) > 0) {
                foreach ($_items as $_item) {
                    $items[] = ['id' => $_item->id, 'name' => $_item->name];
                }
            }
        }
        return response()->json(['status' => true, 'message' => __('getting_project_technologies'), 'technologies' => $items]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function projectMemberHistory(Request $request): JsonResponse
    {
        if($request->user()->can('view projects')){
            return  response()->json([
                'status' => true,
                'message' => __('get_project_member_history'),
                'projectMemberHistory' => $this->userProjectService->getMemberHistory($request->projectId, $request->userId)
            ]);
        }
        return response()->json(['status' => true, 'message' => __('getting_project_technologies'), 'projectMemberHistory' => []]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function projectMembers(Request $request): JsonResponse
    {
        if($request->user()->can('view projects')){
            return  response()->json([
                'status' => true,
                'message' => __('get_project_members'),
                'projectMembers' => $this->projectService->getMembers($request->projectId)
            ]);
        }
        return response()->json(['status' => true, 'message' => __('getting_project_technologies'), 'projectMembers' => []]);
    }

    /**
     * Display a listing of the resource.
     * @param  ProjectsUpdateMemberHistoryRequest  $request
     * @return JsonResponse
     */
    public function updateProjectMemberHistory(ProjectsUpdateMemberHistoryRequest $request): JsonResponse
    {
        if($request->user()->can('view projects')){
            $userProjectRole = $this->userProjectRoleService->findByName($request->userRole);
            if (empty($userProjectRole)) {
                $userProjectRole = $this->userProjectRoleService->add([
                    'name' => $request->userRole
                ]);
            }
            $validatedData = $request->validated();
            unset($validatedData['userRole']);
            $validatedData['userProjectRoleId'] = $userProjectRole->id;

            if (empty($validatedData['userProjectId'])) { // add new history item
                $projectMemberHistory = $this->userProjectService->add([
                    'user_id' => $validatedData['userId'],
                    'project_id' => $validatedData['projectId'],
                    'user_project_role_id' => $validatedData['userProjectRoleId'],
                    'rate' => $validatedData['rate'],
                    'rate_currency' => $validatedData['rateCurrency'],
                    'start_date' => $validatedData['startDate'],
                    'end_date' => $validatedData['endDate'],
                    'status' => $validatedData['status'],
                    ]);
            } else { // update history item
                $projectMemberHistory = $this->userProjectService->updateMemberHistory($validatedData);
            }

            return  response()->json([
                'status' => true,
                'message' => __('updated_project_member_history'),
                'projectMemberHistory' => $projectMemberHistory
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'projectMemberHistory' => null]);
    }

    /**
     * Display a listing of the resource.
     * @param  ProjectsRemoveMemberHistoryRequest $request
     * @return JsonResponse
     */
    public function removeProjectMemberHistory(ProjectsRemoveMemberHistoryRequest $request): JsonResponse
    {
        if($request->user()->can('view projects')){
            return  response()->json([
                'status' => true,
                'message' => __('removed_project_member_history'),
                'projectMemberHistory' => $this->userProjectService->removeMemberHistory($request->validated())
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'projectMemberHistory' => null]);
    }

    /**
     * Display a listing of the resource.
     * @param  ProjectsUnassignedMemberRequest $request
     * @return JsonResponse
     */
    public function unassignedMemberFromProject(ProjectsUnassignedMemberRequest $request): JsonResponse
    {
        if($request->user()->can('view projects')){
            return  response()->json([
                'status' => true,
                'message' => __('unassigned_member_from_project'),
                'projectMemberHistory' => $this->userProjectService->unassignedMemberFromProject($request->validated())
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'projectMemberHistory' => null]);
    }

    /**
     * Display a listing of the resource.
     * @param  ProjectsListRequest  $request
     * @return JsonResponse
     */
    public function list(ProjectsListRequest $request): JsonResponse
    {
        $pageSize = $request->pageSize ?? 12;
        $loggedUser = auth()->user();
        $projects = [];
        if ($request->user()->can('view projects')) {
            $itemsQuery = $this->projectService->getFilteredQuery($request, $loggedUser);
        } elseif ($loggedUser->can('view self projects')) {
            $projectIds = $loggedUser->projects->pluck('id')->all();
            $itemsQuery = $this->projectService->getFilteredQuery($request, $loggedUser, $projectIds);
        }
        if (isset($itemsQuery) && $itemsQuery !== null) {
            $projects = $this->projectService->orderByNameAndPaginate($itemsQuery, $pageSize);
        }

        return response()->json(['status' => true, 'message' => __('getting_projects'), 'projects' => $projects]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  ProjectsStoreRequest  $request
     * @return JsonResponse
     */
    public function store(ProjectsStoreRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        if($loggedUser->can('create', $this->projectService->getModel())) // Here is working the ProjectPolicy
        {
            if (!in_array($request['status'], $this->projectService->getStatuses())) {
                return response()->json(['status' => false, 'message' => __('invalid_project_data'), 'project' => null]);
            }

            $item = $this->projectService->createProject([
                "name" => $request['name'],
                "description" => isset($request['description']) ? $request['description'] : null,
                "status" => $request['status'],
                "user_id" => $loggedUser->id,
                "color" => $request['color'],
                "type" => $request['type'],
                "price" => $request['price'] ?? null,
                "price_currency" => $request['price_currency'] ?? config('app.default_currency'),
                "deadline" => $request['deadline']
            ]);

            if ($item) {
                // remove assigned users history from project
                if (!empty($request['removedUserProjectIds'])) {
                    $this->userProjectService->removeUserProjectItems($request['removedUserProjectIds'], $item->id);
                }
                //assign users to project logic
                if (isset($request['selectedUsersList']) && count($request['selectedUsersList']) > 0) {
                    if ($loggedUser->can('assign user to project')) {
                        $projectUserRoleNames = $this->userProjectRoleService->createNewUserProjectRoles($request['selectedUsersList']);
                        $projectUserRoles = $this->userProjectRoleService->getUserProjectRolesByNames($projectUserRoleNames, ['id', 'name']);
                        $this->userProjectService->createNewUserProject($request['selectedUsersList'], $projectUserRoles, $item->id);
                    }
                }

                // Add  project's technologies
                if (isset($request->project_technology)) {
                    $this->technologyService->createNewTechnology($request->project_technology);
                    $projectTechnologyToSave = $this->technologyService->getTechnologyIdsByNames($request->project_technology);
                    if (count($projectTechnologyToSave) > 0) {
                        $this->projectTechnologyService->createNewProjectTechnology($projectTechnologyToSave, $item->id);
                    }
                }

                return response()->json(['status' => true, 'message'=> __('The project added successfully'), 'project' => $item]);
            }
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'project' => null]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return array
     */
    public function show(int $id): array
    {
        $loggedUser = auth()->user();
        $projectIds = $loggedUser->projects->pluck('id')->all();
        $isOwnerPage = in_array($id, $projectIds);
        if (!($loggedUser->can('view projects') || ($isOwnerPage && $loggedUser->can('view self projects')))){
            return ['status' => false, 'message' => __('Access Denied')];
        }
        $project = Project::where('projects.id', $id)->first();
//        if ($loggedUser->can('view project_price')) {
//            // todo get project prices and add it to query
//        }

        $members = Project::join('reports_view', 'projects.id', '=', 'reports_view.project_id')
            ->join('users', 'reports_view.work_user_id', '=', 'users.id')
            ->select('users.name as user_name')
            ->where('projects.id', $id)
            ->groupBy('users.id')
            ->get();


        $query = Project::join('works', 'projects.id', '=', 'works.project_id')
            ->join('work_times', 'works.id', '=', 'work_times.work_id')
            ->groupBy('projects.id')
            ->where('projects.id', $id);
        $totalDuration = $query->sum('work_times.duration');
        $totalCount = $query->count('work_times.work_id');

        return [
            'project' => $project,
            'totalDuration' => number_format($totalDuration / 3600, 2),
            'totalCount' => $totalCount,
            'members' => $members,
        ];
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  ProjectsUpdateRequest  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(ProjectsUpdateRequest $request, int $id): JsonResponse
    {
        $loggedUser = $request->user();
        $item = $this->projectService->find($id);
        if($loggedUser->can('update', $item))
        {
            if(empty($item)){
                return response()->json(['status' => false, 'message' => __('Invalid project'), 'data' => null]);
            }

            // remove assigned users history from project
            if (!empty($request['removedUserProjectIds'])) {
                $this->userProjectService->removeUserProjectItems($request['removedUserProjectIds'], $item->id);
            }

            //assign users to project functionality
            if (isset($request['selectedUsersList'])) {
                if ($loggedUser->can('assign user to project')) {
                    $newAssignedUsers = $request['selectedUsersList'];
                    $projectUserRoleNames = $this->userProjectRoleService->createNewUserProjectRoles($request['selectedUsersList']);
                    $projectUserRoles = $this->userProjectRoleService->getUserProjectRolesByNames($projectUserRoleNames, ['id', 'name']);

                    if (count($newAssignedUsers) > 0) {
                        $newAssignedUserIds = [];
                        foreach ($newAssignedUsers as $newUser) {
                            $newAssignedUserIds[] = $newUser['id'];
                            $newUserRoleId = null;
                            if ($projectUserRoles) {
                                foreach ($projectUserRoles as $projectUserRole) {
                                    if ($projectUserRole->name === $newUser['userRole']) {
                                        $newUserRoleId = $projectUserRole->id;
                                        break;
                                    }
                                }
                            }
                            $currentUserProject = $this->userProjectService->getUserProjectByUserIdAndProjectId($newUser['id'], $id);
                            if ($currentUserProject) {
                                if ($currentUserProject->user_project_role_id !== $newUserRoleId) {
                                    $this->userProjectService->updateUserProjectRoleId(['user_project_role_id' => $newUserRoleId], $currentUserProject->id);
                                }
                            }
                        }

                        $existingAssignedUserIds = $this->userProjectService->getExistingAssignedUserIds($id);
                        $usersToAttach = array_diff($newAssignedUserIds, $existingAssignedUserIds);
                        $usersToDetach = array_diff($existingAssignedUserIds, $newAssignedUserIds);

                        if (count($usersToAttach) > 0) {
                            $this->userProjectService->createNewAndChangeExistingUsers($usersToAttach, $projectUserRoles, $newAssignedUsers, $id);
                        }

                        if (count($usersToDetach) > 0) {
                            $this->userProjectService->detachUsers($id, $usersToDetach);
                        }
                    } else {
                        $this->userProjectService->detachUsers($id);
                    }
                }
            }

            // Update  project's technologies
            $existingProjectTechnology = $this->projectTechnologyService->getExistingProjectTechnologyIds($id);
            if (isset($request->project_technology)) {
                $this->technologyService->createNewTechnology($request->project_technology);
                $checkedProjectTechnology = $this->technologyService->getTechnologyIdsByNames($request->project_technology);
                $projectTechnologyToSave = array_diff($checkedProjectTechnology, $existingProjectTechnology);
                $projectTechnologyToDelete = array_diff($existingProjectTechnology, $checkedProjectTechnology);

                if (count($projectTechnologyToSave) > 0) {
                    $this->projectTechnologyService->createNewProjectTechnology($projectTechnologyToSave, $item->id);
                }
                if (count($projectTechnologyToDelete) > 0) {
                    $this->projectTechnologyService->deleteProjectTechnology($item->id, $projectTechnologyToDelete);
                }

            } else {// if request project technology doesn't exist but project has technology in db, we'll delete all the project technologies
                if (count($existingProjectTechnology) > 0) {
                    $this->projectTechnologyService->deleteProjectTechnology($item->id);
                }
            }

            if ($this->projectService->updateProject($request, $id)) {
                $data = $this->projectService->find($id);
                return response()->json(['status' => true, 'message'=> __('The project edited successfully'), 'data' => $data]);
            }
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $item = Project::find($id);

        if(auth()->user()->can('delete', $item))
        {
            $data = $item->delete();
            return response()->json(['status' => true, 'message' => __('The project deleted'), 'data' => $data]);
        }
        return response()->json(['status' => false, 'message' => __('Invalid data'), 'data' => null]);
    }

    /**
     * @param ProjectsListRequest $request
     * @return JsonResponse
     */
    public function export(ProjectsListRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('view projects')) {
            $projectsQuery = $this->projectService->getFilteredQuery($request, $loggedUser);

            return response()->json([
                'status' => true,
                'message' => __('getting_projects_list_for_export'),
                'data' => $this->projectService->getProjectsItems($projectsQuery)
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong')]);
    }
}
