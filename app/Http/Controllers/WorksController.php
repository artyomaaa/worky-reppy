<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddEventForFullCalendarRequest;
use App\Http\Requests\StartWorkFromFullCalendarRequest;
use App\Http\Requests\StopWorkFromFullCalendarRequest;
use App\Http\Requests\StartWorkFromTodoRequest;
use App\Http\Requests\UpdateEventForFullCalendarRequest;
use App\Http\Requests\WorkListRequest;
use App\Http\Requests\WorksRemoveWorkTimeRequest;
use App\Http\Requests\WorksSearchRequest;
use App\Http\Requests\WorksStartNewWorkRequest;
use App\Http\Requests\WorksStartRequest;
use App\Http\Requests\WorksStopRequest;
use App\Http\Requests\WorksStoreRequest;
use App\Http\Requests\WorksTagRequest;
use App\Http\Requests\WorksUpdateRequest;
use App\Http\Requests\WorksUpdateActiveTaskRequest;
use App\Http\Requests\WorksReportRequest;
use App\Models\Project;
use App\Models\Tag;
use App\Models\Work;
use App\Models\WorkTime;
use App\Models\WorkTimeTag;
use App\Services\Interfaces\ClientHourServiceInterface;
use App\Services\Interfaces\TagServiceInterface;
use App\Services\Interfaces\TodoServiceInterface;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\Interfaces\WorkServiceInterface;
use App\Services\Interfaces\WorkTimeServiceInterface;
use App\Services\Interfaces\WorkTimeTagServiceInterface;
use App\Services\Interfaces\ProjectServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Spatie\Period\Period;
use Spatie\Period\PeriodCollection;
use Spatie\Period\Precision;

class WorksController extends Controller
{
    /**
     * @var TagServiceInterface
     */
    private $tagService;

    /**
     * @var WorkServiceInterface
     */
    private $workService;

    /**
     * @var WorkTimeServiceInterface
     */
    private $workTimeService;

    /**
     * @var WorkTimeTagServiceInterface
     */
    private $workTimeTagService;

    /**
     * @var TodoServiceInterface
     */
    private $todoService;

    /**
     * @var UserServiceInterface
     */
    private $userService;

    /**
     * @var ClientHourServiceInterface
     */
    private $clientHourService;

    /**
     * @var ProjectServiceInterface
     */
    private $projectService;

    public function __construct(
        TagServiceInterface $tagService,
        WorkServiceInterface $workService,
        WorkTimeServiceInterface $workTimeService,
        WorkTimeTagServiceInterface $workTimeTagService,
        TodoServiceInterface $todoService,
        UserServiceInterface $userService,
        ClientHourServiceInterface $clientHourService,
        ProjectServiceInterface $projectService
    )
    {
        $this->tagService = $tagService;
        $this->workService = $workService;
        $this->workTimeService = $workTimeService;
        $this->workTimeTagService = $workTimeTagService;
        $this->todoService = $todoService;
        $this->userService = $userService;
        $this->clientHourService = $clientHourService;
        $this->projectService = $projectService;
    }

    /**
     * Display a listing of the resource.
     * @param  WorkListRequest  $request
     * @return JsonResponse
     */
    public function list(WorkListRequest $request): JsonResponse
    {
        $items = [];
        $workTimeTags = [];
        $todayBusyTimes = [];
        $stoppedTotalDuration = 0;
        $loggedUser = $request->user();
        $startDateTime = Carbon::parse($request->start_date_time, $loggedUser->time_offset)->startOfDay()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
        $endDateTime = Carbon::parse($request->start_date_time, $loggedUser->time_offset)->endOfDay()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
        $isDisplayByGroup = isset($request->displayByGroup) && filter_var($request->displayByGroup, FILTER_VALIDATE_BOOLEAN);
        $isAnySubmittedItem = false;
        $latestTask = null;
        if ($loggedUser->can('viewAny', Work::class)) {
            $worksQuery = $this->workService->getTodayWorksQuery($loggedUser->id, $startDateTime, $endDateTime);
            // checking is any submitted item?
            $isAnySubmittedItem = (clone $worksQuery)->where('submitted', 1)->exists();
            $filteredWorkTimesIds = [];
            if ($isDisplayByGroup) {
                $worksResultData = $worksQuery->get()->groupBy('id');
                $worksCollectionObj = collect($worksResultData);
                foreach ($worksCollectionObj as $workName => $workList){
                    foreach ($workList as $work){
                        array_push($filteredWorkTimesIds, $work->work_time_id);
                    }
                }
                $items = $this->paginate($worksCollectionObj, 'api/tasks/list');
            } else {
                $items = $worksQuery->paginate(config('app.default_per_page'));
                foreach ($items as $item){
                    array_push($filteredWorkTimesIds, $item->work_time_id);
                }
            }
            $workTimesComments = $this->workTimeService->getIdsWithComments($filteredWorkTimesIds);
            $workTimesComments = collect($workTimesComments)->groupBy('id');

            $workTimesIds = [];
            if ($isDisplayByGroup) {
                foreach ($items as $workName => $workList){
                    foreach ($workList as $work){
                        $work->comments = isset($workTimesComments[$work->work_time_id][0]) ? $workTimesComments[$work->work_time_id][0]->comments : [];
                        if (!in_array($work->work_time_id, $workTimesIds)) {
                            $workTimesIds[] = $work->work_time_id;
                        }
                    }
                }
            } else {
                foreach ($items as $item){
                    $item->comments = isset($workTimesComments[$item->work_time_id][0]) ? $workTimesComments[$item->work_time_id][0]->comments : [];
                    if (!in_array($item->work_time_id, $workTimesIds)) {
                        $workTimesIds[] = $item->work_time_id;
                    }
                }
            }

//            $workTimesIds = $this->workService->getWorkTimeIdsByUserId($loggedUser->id);
            $workTimeTags = $this->workTimeTagService->getTagsByWorkTimeIdsAndStartEndDateTime($workTimesIds, $startDateTime, $endDateTime);
            $stoppedTotalDuration = $this->workService->stoppedTotalDuration($loggedUser->id, $startDateTime, $endDateTime);

//            $todayStartDate = Carbon::parse($request->todayDate, $loggedUser->time_offset)->startOfDay()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
//            $todayEndDate = Carbon::parse($request->todayDate, $loggedUser->time_offset)->endOfDay()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
              $todayBusyTimes = $this->workService->getTodayBusyTimes($loggedUser->id, $startDateTime, $endDateTime);
              $latestTask = $this->workService->getLatestTask($loggedUser->id, $startDateTime, $endDateTime);
        }
        return response()->json(
            [
                'status' => true,
                'message' => __('getting_works'),
                'works' => $items,
                'isAnySubmittedItem' => $isAnySubmittedItem,
                'stoppedTotalDuration' => $stoppedTotalDuration,
                'workTimeTags' => $workTimeTags,
                'todayBusyTimes' => $todayBusyTimes,
                'latestTask' => $latestTask,
            ]
        );
    }

    public function searchTask(Request $request)
    {
        $loggedUser = $request->user();
        if ($loggedUser->can('viewAny', Work::class)) {
            $itemsQuery = Project::where('status', 1)->orderBy('name');
            //logged user see only their assigned projects if not Administrator
            if ($loggedUser->can('view self projects')) {
                $projectsIds = collect($loggedUser->projects)->pluck('id')->all();
                $itemsQuery->whereIn('id', $projectsIds);
            }
            $ids = $itemsQuery->pluck('id');
            return Work::getAllWorks($request->value, $ids);
        }
    }
    /**
     * The attributes that are mass assignable.
     * @param  $items
     * @param  $perPage
     * @param  $page
     * @param  $path
     * @return mixed
     */
    public function paginate($items, $path='', $perPage = null, $page = null)
    {
        $perPage = !$perPage ? env('DEFAULT_PER_PAGE') : $perPage;
        $options = ['path'=>url($path)];
        $page = $page ?: (Paginator::resolveCurrentPage() ?: 1);
        $items = $items instanceof Collection ? $items : Collection::make($items);
        return new LengthAwarePaginator($items->forPage($page, $perPage), $items->count(), $perPage, $page, $options);
    }

    /**
     * Display a listing of the resource.
     * @param WorksReportRequest $request
     * @return JsonResponse
     */
    public function getWorks(WorksReportRequest $request): JsonResponse
    {
        $loggedUser = auth()->user();
        $items = [];
        if ($loggedUser->can('view works')) {
            $startDateTime = Carbon::parse($request->date_time, $loggedUser->time_offset)->startOfDay()->timezone('UTC')->format('Y-m-d H:i:s');
            $endDateTime = Carbon::parse($request->date_time, $loggedUser->time_offset)->endOfDay()->timezone('UTC')->format('Y-m-d H:i:s');
            $items = $this->workService->getWorksData($loggedUser->id, $startDateTime, $endDateTime);
            $workIds = Arr::pluck($items, 'work_id');
            $tags = $this->tagService->getTagsByWorkId($workIds);
            foreach ($items as $item) {
                $item->tags = [];
                foreach ($tags as $tag) {
                    if ($tag->id != null && $tag->work_time_id === $item->work_time_id && !in_array($tag, $item->tags)) {
                        $item->tags[] = $tag;
                    }
                }
            }
        }
        return response()->json(['status' => true, 'message' => __('getting_works'), 'works' => $items]);
    }

    public function search(WorksSearchRequest $request) {

        // TODO should we add permission check?
        if (!empty($request->searchValue)) {
            $search = $request->searchValue;
            $startDateTime = Carbon::parse($request->start_date_time)->format('Y-m-d H:i:s');
            $isDisplayByGroup = isset($request->displayByGroup) && filter_var($request->displayByGroup, FILTER_VALIDATE_BOOLEAN);
            $items = [];
            $userId = auth()->user()->id;

            $worksQuery = Work::leftJoin('projects', 'projects.id', '=', 'works.project_id')
                ->leftJoin('work_times', 'works.id', '=', 'work_times.work_id')
                ->select(
                    'works.*',
                    'projects.name as project_name', 'projects.color as project_color',
                    'work_times.id as work_time_id',
                    'work_times.start_date_time',
                    'work_times.end_date_time',
                    'work_times.duration',
                    'work_times.submitted'
                )
                ->where('works.user_id', $userId)
                ->whereDate('work_times.start_date_time', $startDateTime)
                ->where(function($query) use ($search)
                {
                    $query->where('works.name', 'like', '%' . $search . '%')
                        ->orWhere('projects.name', 'like', '%' . $search . '%')
                        ->orWhereHas('workTimes.tags', function($query) use ($search){
                            $query->where("name", 'like', '%' . $search . '%');
                        });
                })
                ->orderBy('work_times.start_date_time', 'desc')
                ->orderBy('work_times.end_date_time', 'desc');

            if ($isDisplayByGroup) {
                $worksResultData = $worksQuery->get()->groupBy('name');
                $worksCollectionObj = collect($worksResultData);
                $items = $this->paginate($worksCollectionObj, 'api/tasks/list');
            } else {
                $items = $worksQuery->paginate(env('DEFAULT_PER_PAGE'));
            }

            return response()->json(['status' => true, 'message' => __('searched_works'), 'results' => $items]);
        }
        return response()->json(['status' => true, 'message' => __('searched_works'), 'results' => []]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getTags(Request $request): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('viewAny', Tag::class)) {
            return response()->json(['status' => false, 'message' => __('Access denied'), 'tags' => []]);
        }
        $items = $this->tagService->getTagsByUserId($loggedUser->id);

        return response()->json(['status' => true, 'message' => __('messages.Getting tags'), 'tags' => $items]);
    }

    /**
     * @param WorksTagRequest $request
     * @return JsonResponse
     */
    public function createTag(WorksTagRequest $request): JsonResponse
    {
        $name = $request->name;
        $color = $request->color;
        $loggedUser = $request->user();
        if (!$loggedUser->can('create', Tag::class)) {
            return response()->json(['status' => false, 'message' => __('Access denied'), 'tag' => null]);
        }

        $existingTag = Tag::where([
            ['user_id', '=', $loggedUser->id],
            ['name', '=', trim($name)],
            ['color', '=', $color],
        ])->first();
        if ($existingTag === null) {
            $tag = new Tag([
                "user_id" => $loggedUser->id,
                "name" => $name,
                "color" => $color,
            ]);
            if($tag->save()) {
                return response()->json(['status' => true, 'message' => __('tag_is_created'), 'tag' => $tag]);
            }
            return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'tag' => null]);
        } else {
            return response()->json(['status' => true, 'message' => __('tag_exists'), 'tag' => []]);
        }

    }

    /**
     * @param WorksTagRequest $request
     * @param $id
     * @return JsonResponse
     */
    public function updateTag(WorksTagRequest $request, $id): JsonResponse
    {
        $loggedUser = $request->user();
        $item = Tag::where([
            ['id', '=', $id],
            ['user_id', '=', $loggedUser->id]
        ])->first();

        if (!$loggedUser->can('update', $item)) {
            return response()->json(['status' => false, 'message' => __('Access denied'), 'tag' => null]);
        }

        if ($item) {
            $item->name = trim($request->name);
            $item->color = $request->color;
            if ($item->save()) {
                return response()->json(['status' => true, 'message' => __('tag_is_updated'), 'tag' => $item]);
            }
            return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'tag' => null]);
        }
        return response()->json(['status' => false, 'message' => __('tag_does_not_exist'), 'tag' => null]);
    }

    public function deleteTag(Request $request, $id): JsonResponse
    {
        $item = Tag::where('id', $id)->first();
        $loggedUser = $request->user();
        if (!$loggedUser->can('delete', $item)) {
            return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => $item]);
        }

        if (!empty($item) && $item->delete()) {
            return response()->json(['status' => true, 'message' => __('Tag is deleted'), 'data' => $item]);
        }
        return response()->json(['status' => false, 'message' => __('Something went wrong'), 'data' => $item]);
    }

    /**
     * Display a listing of the resource.
     * @param  Request  $request
     * @return JsonResponse
     */
    public function projectList(Request $request): JsonResponse
    {
        $loggedUser = $request->user();
        if($loggedUser->can('view projects')){
            $itemsQuery = $this->projectService->getAllProjectsQuery();
        } else {
            $projectsIds = collect($loggedUser->projects)->pluck('id')->all();
            $itemsQuery = $this->projectService->getUserAttachedProjectsQuery($projectsIds);
        }
        $items = $itemsQuery->get(['id', 'name', 'color']);

        return response()->json(['status' => true, 'message' => __('getting_projects'), 'projects' => $items]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function tagsList(Request $request): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('viewAny', Tag::class)) {
            return response()->json(['status' => false, 'message' => __('Access denied'), 'tags' => []]);
        }

        $items = Tag::orderBy('name')->where('user_id', '=', $loggedUser->id)->get(['id', 'user_id', 'name', 'color']);
        return response()->json(['status' => true, 'message' => __('messages.Getting tags'), 'tags' => $items]);
    }

    /**
     * @param WorksUpdateActiveTaskRequest $request
     * @return mixed
     */
    public function updateActiveTask(WorksUpdateActiveTaskRequest $request)
    {
        $loggedUser = auth()->user();
        $projectId = $request->projectId === 0 ? null : $request->projectId;
        $startedWorkTime = Work::getStartedWorkByUserId($loggedUser->id);

        if ($startedWorkTime) {
            $startedWork = Work::firstOrCreate([
                'user_id' => $loggedUser->id,
                'project_id' => $projectId,
                'name' => $request->taskName,
            ]);

            WorkTime::where([
                "end_date_time" => null,
                "id" => $startedWorkTime->work_time_id
            ])->update(['work_id' => $startedWork->id]);

            if (isset($request->tags)) {
                $tagIds = $this->tagService->getTagsByIds($request->tags)->pluck('id')->toArray();
                WorkTimeTag::updateWorkTag($startedWorkTime->work_time_id, $tagIds);
            }
        }
        return $startedWorkTime;
    }

    /**
     * On start action
     *
     * @param  WorksStartRequest  $request
     * @return JsonResponse
     */
    public function start(WorksStartRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if($loggedUser->can('create', Work::class)){
            WorkTime::stopStartedWork($loggedUser->id);
            $nowDateTimeUTC = Carbon::now();

            if($request->work_id){
                // if started again work time
                $workTime = new WorkTime([
                    "work_id" => $request->work_id,
                    "start_date_time" => $nowDateTimeUTC,
                ]);
                $workTime->save();
                if($request->tagIds && $request->work_time_id){
                    $tagIds = $this->tagService->getTagsByIds($request->tagIds)->pluck('id')->toArray();
                    WorkTimeTag::addWorkTimeTags($workTime->id, $tagIds);
                }
                $work = Work::with('workTimes')->where('id', $workTime->id)->first();
                return response()->json(['status' => true, 'message' => __('The work time added successfully'), 'data' => $work]);
            }
            $work = $this->workService->getWorkByName(trim($request->name), $loggedUser->id, $request->project_id);
            if (empty($work)) {
                // new work
                if(Validator::make($request->all(), ['name' => 'required|max:191'])->fails()){
                    return response()->json(['status' => false, 'message' => __('The name field is required'), 'data' => null]);
                }
                $work = $this->workService->add([
                    "name" => trim($request['name']),
                    "project_id" => !empty($request->project_id) ? $request->project_id : null,
                    "user_id" => $loggedUser->id,
                ]);
            }
            $workTime = new WorkTime([
                "work_id" => $work->id,
                "start_date_time" => $nowDateTimeUTC,
                "end_date_time" => null, // just now started
            ]);
            $workTime->save();
            if (array_key_exists('tagIds', $request->all()) && count($request->tagIds) > 0) {
                $tagIds = $this->tagService->getTagsByIds($request->tagIds)->pluck('id')->toArray();
                WorkTimeTag::addWorkTimeTags($workTime->id, $tagIds);
            }
            $work = Work::with('workTimes')->where('id', $work->id)->first();
            return response()->json(['status' => true, 'message' => __('The work time added successfully'), 'data' => $work]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  WorksStoreRequest  $request
     * @return JsonResponse
     */
    public function store(WorksStoreRequest $request)
    {
        $loggedUser = $request->user();
        if($loggedUser->can('create', Work::class)) // Here is working the WorkPolicy
        {
            $isToday = true;
            $selectedDate = null;
            try {
                if (!empty($request->selectedDate)) {
                    $selectedDate = substr(trim($request->selectedDate),0, 10);
                    $isToday = Carbon::parse($selectedDate)->isToday();
                }
            } catch (\Exception $exception){
                \Log::error($exception->getMessage());
            }

            $todayFormat = Carbon::today($loggedUser->time_offset)->format('Y-m-d');
            $startTimeFormat = $todayFormat . ' ' . $request->start_date_time;
            $endTimeFormat = $todayFormat . ' ' . $request->end_date_time;
            if (!$isToday && $selectedDate) {
                $startTimeFormat = $selectedDate . ' ' . $request->start_date_time;
                $endTimeFormat = $selectedDate . ' ' . $request->end_date_time;
            }

            $startDateTime = Carbon::parse($startTimeFormat, $loggedUser->time_offset)->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
            $endDateTime = Carbon::parse($endTimeFormat, $loggedUser->time_offset)->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
            $utcNow = Carbon::now($loggedUser->time_offset)->setTimezone(config('app.timezone'));


            // this comparison is needed to create mobile APP
            $compareStartAndEndDateTime = Carbon::parse($startDateTime)->diff(Carbon::parse($endDateTime));
            if ($compareStartAndEndDateTime->invert == 1) {
                return response()->json(['status' => false, 'message' => __('There is a difference with the choice of times'), 'data' => null]);
            }

            $startEndPeriod = Period::make($startDateTime, $endDateTime ?? $utcNow, Precision::SECOND);
            $todayBusyTimes = $this->workService->getTodayBusyTimes($loggedUser->id, $startDateTime, $endDateTime);
            $intersectRanges = false;
            foreach ($todayBusyTimes as $todayBusyTime) {
                $busyStart = Carbon::parse($todayBusyTime['start_date_time']);
                $busyEnd = $todayBusyTime['end_date_time'] ? Carbon::parse($todayBusyTime['end_date_time']) : $utcNow;
                $busyPeriod = Period::make($busyStart, $busyEnd, Precision::SECOND);
                if ((new PeriodCollection($startEndPeriod))->intersect($busyPeriod)->count()) {
                    $intersectRanges = true;
                    break;
                }
            }

            if ($intersectRanges) {
                return response()->json(['status' => false, 'message'=> __('Invalid start-end time range'), 'data' => null]);
            }

            if ($isToday) {
                $message = $this->compareStartEndTimeWithNow($request->start_date_time, $request->end_date_time);
            } else {
                $message = $this->compareStartEndTimeWithSelectedDate($request->start_date_time, $request->end_date_time, $selectedDate);
            }

            if(!empty($message)) {
                return response()->json(['status' => false, 'message' => $message, 'data' => null]);
            }
            $checkingItemQuery = Work::where([
                ['user_id', '=', $loggedUser->id],
                ['name', '=', trim($request->name)],
            ]);
            if($request->project_id) {
                $checkingItemQuery = $checkingItemQuery->where('project_id', $request->project_id);
            } else {
                $checkingItemQuery = $checkingItemQuery->whereNull('project_id');
            }
            $item = $checkingItemQuery->first();
            if (empty($item)){ // new item situation
                $item = new Work();
                $item->fill([
                    "name" => trim($request->name),
                    "project_id" => $request->project_id ? $request->project_id : null,
                    "user_id" => $loggedUser->id,
                ]);
                $item->save();
            }

            if($isToday){
                WorkTime::stopStartedWork($loggedUser->id);
            }
            $time = new WorkTime([
                "work_id" => $item->id,
                "start_date_time" =>  $startDateTime,
                "end_date_time" => $endDateTime,
                "duration" => $request['duration'],
            ]);
            $time->save();
            if ($request['tagIds'] && count($request['tagIds']) > 0) {
                $tagIds = $this->tagService->getTagsByIds($request['tagIds'])->pluck('id')->toArray();
                WorkTimeTag::addWorkTimeTags($time->id, $tagIds);
            }
            $work = Work::with('workTimes')->where('id', $item->id)->first();

            return response()->json(['status' => true, 'message' => __('The work time added successfully'), 'data' => $work]);
        }
        return response()->json(['status' => false, 'message' => __('Something went wrong'), 'data' => null]);
    }

    /**
     * Display the specified resource.
     * @param int $id
     * @return \Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Eloquent\Model|object|null
     */
    public function show($id)
    {
        // TODO should we add permission check?
        return Work::with('workTimes')->where('id', $id)->first();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  WorksUpdateRequest  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(WorksUpdateRequest $request, int $id): JsonResponse
    {
        $loggedUser = auth()->user();
        if ($this->_compareEndTimeWithCurrentTime($request['formValues']['end_date_time'])) {
            return response()->json(['status' => false, 'message' => __('You have chosen a time that has not come yet'), 'data' => null]);
        }
        $item = Work::where('id', $id)->where('user_id', $loggedUser->id)->first();
        if($loggedUser->can('update', $item))
        {
            if(empty($item)){
                return response()->json(['status' => false, 'message' => __('Invalid work'), 'data' => null]);
            }
            $utcNow = Carbon::now($loggedUser->time_offset)->setTimezone(config('app.timezone'));
            $_startDateTime = Carbon::parse($request['formValues']['start_date_time'], $loggedUser->time_offset)->setTimezone('UTC');
            $_endDateTime = $request['formValues']['end_date_time']
                ? Carbon::parse($request['formValues']['end_date_time'], $loggedUser->time_offset)->setTimezone('UTC')
                : null;

            $startEndPeriod = Period::make($_startDateTime, $_endDateTime ?? $utcNow, Precision::SECOND);
            $startDateTime = Carbon::parse($request['formValues']['start_date_time'], $loggedUser->time_offset)->startOfDay()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
            $endDateTime = Carbon::parse($request['formValues']['start_date_time'], $loggedUser->time_offset)->endOfDay()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');
            $todayBusyTimes = $this->workService->getTodayBusyTimes($loggedUser->id, $startDateTime, $endDateTime);
            $intersectRanges = false;
            foreach ($todayBusyTimes as $todayBusyTime) {
                if (!($todayBusyTime['id'] === $request->work_id && $todayBusyTime['work_time_id'] === $request->work_time_id)) {
                    $busyStart = Carbon::parse($todayBusyTime['start_date_time']);
                    $busyEnd = $todayBusyTime['end_date_time'] ? Carbon::parse($todayBusyTime['end_date_time']) : $utcNow;
                    $busyPeriod = Period::make($busyStart, $busyEnd, Precision::SECOND);
                    if ((new PeriodCollection($startEndPeriod))->intersect($busyPeriod)->count()) {
                        $intersectRanges = true;
                        break;
                    }
                }
            }

            if ($intersectRanges) {
                return response()->json(['status' => false, 'message'=> __('Invalid start-end time range'), 'data' => null]);
            }

            $startDateTime = $_startDateTime->format('Y-m-d H:i:s');
            $endDateTime = $_endDateTime ? $_endDateTime->format('Y-m-d H:i:s') : null;

            $message = $this->compareStartEndTimeWithNow($request->start_date_time, $request->end_date_time);
            if(!empty($message)) {
                return response()->json(['status' => false, 'message' => $message, 'data' => null]);
            }

            $name = trim($request['formValues']['name']);
            $checkingItemQuery = Work::where([
                ['id', '!=', $id],
                ['user_id', '=', $loggedUser->id],
                ['name', '=', $name],
            ]);
            if (!empty($request['project_id'])) {
                $checkingItemQuery = $checkingItemQuery->where('project_id', $request['project_id']);
            } else {
                $checkingItemQuery = $checkingItemQuery->whereNull('project_id');
            }
            $checkingItem = $checkingItemQuery->first();
            if (empty($checkingItem)) { // Editing work
                $fillData = [
                    "name" => $name,
                    "project_id" => !empty($request['project_id']) ? $request['project_id'] : null,
                ];
                $workQuery = Work::where('name', '=', $fillData['name'])
                    ->where('user_id', '=', $loggedUser->id);

                !empty($fillData['project_id'])
                    ? $workQuery->where('project_id', '=', $fillData['project_id'])
                    : $workQuery->whereNull('project_id');

                $work = $workQuery->first();
                if ($work) {
                    $workTime = WorkTime::updateStartEndWorkTime(
                        $request['ongoingTask'],
                        $request['work_id'],
                        $request['work_time_id'],
                        $request['formValues']['description'],
                        $startDateTime,
                        $endDateTime
                    );

                    if ($workTime) {
                        WorkTimeTag::where('work_time_id', $request['work_time_id'])->delete();
                        if (count($request['tagIds']) > 0) {
                            $tagIds = $this->tagService->getTagsByIds($request['tagIds'])->pluck('id')->toArray();
                            WorkTimeTag::updateWorkTag(
                                $request['work_time_id'],
                                $tagIds
                            );
                        }
                        return response()->json(['status' => true, 'message' => __('The work edited successfully'), 'data' => $workTime]);
                    }
                    return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
                } else {
                    $newWork = [
                        "name" => $fillData['name'],
                        "project_id" => $fillData['project_id'],
                        "user_id" => $loggedUser->id,
                    ];
                    $work = new Work($newWork);

                    if ($work->save()) {
                        WorkTimeTag::where('work_time_id', $request['work_time_id'])->delete();
                        if (count($request['tagIds']) > 0) {
                            $tagIds = $this->tagService->getTagsByIds($request['tagIds'])->pluck('id')->toArray();
                            WorkTimeTag::updateWorkTag(
                                $request['work_time_id'],
                                $tagIds
                            );
                        }

                        $workTime = WorkTime::where('id', $request['work_time_id'])->where('work_id', $item->id)->first();
                        $this->workTimeService->edit([
                            'work_id' => $work['id'],
                            'description' => $request['formValues']['description'],
                            'start_date_time' => $startDateTime,
                            'end_date_time' => $endDateTime,
                            'duration' => $_endDateTime ? $_endDateTime->diffInSeconds($_startDateTime) : 0,
                        ], $workTime['id']);
                        $checkWorkTime = WorkTime::where('work_id', '=', $item->id)->count();
                        if (!$checkWorkTime) {
                            Work::where('id', '=', $item->id)->delete();
                        }
                        return response()->json(['status' => true, 'message' => __('The work edited successfully'), 'data' => $work]);
                    }
                    return response()->json(['status' => false, 'message' => __('something_went_wrong'), 'data' => null]);
                }
            } else { // need to merge already existing work times
                // todo need to check functionality
                $mergeWorkTime = WorkTime::mergeWorkTime(
                    $request['work_id'],
                    $request['work_time_id'],
                    $loggedUser->id,
                    $checkingItem->id,
                    $request['formValues']['description'],
                    $startDateTime,
                    $endDateTime,
                    $_endDateTime ? $_endDateTime->diffInSeconds($_startDateTime) : 0,
                );
                if(!empty($mergeWorkTime)){
                    WorkTimeTag::where('work_time_id', $mergeWorkTime->id)->delete();
                    if (count($request['tagIds']) > 0 && $mergeWorkTime) {
                        $tagIds = $this->tagService->getTagsByIds($request['tagIds'])->pluck('id')->toArray();
                        WorkTimeTag::updateWorkTag(
                            $mergeWorkTime->id,
                            $tagIds
                        );
                    }
                    return response()->json(['status' => true, 'message'=> __('The work edited successfully'), 'data' => $mergeWorkTime]);
                }
                return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
            }
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return JsonResponse
     */
    public function submitOrResetDayReports(Request $request): JsonResponse
    {
        // TODO should we add permission check?
        $submitted = $request->submitted == "0" ? 0 : 1;

        $loggedUser = auth()->user();
        $date = Carbon::parse($request->date, $loggedUser->time_offset)->toDateString();
        $isToday = Carbon::parse($date)->isToday();
        $startDateTime = Carbon::parse($request->date, $loggedUser->time_offset)->startOfDay()->timezone('UTC')->format('Y-m-d H:i:s');
        $endDateTime = Carbon::parse($request->date, $loggedUser->time_offset)->endOfDay()->timezone('UTC')->format('Y-m-d H:i:s');
        $workTimeIds = Work::join('work_times', 'works.id', '=', 'work_times.work_id')
            ->where('works.user_id', '=', $loggedUser->id)
            ->whereBetween('work_times.start_date_time', [$startDateTime, $endDateTime])
            ->pluck('work_times.id')->toArray();
        if ($request['project_ids']) {
            $validatedData = Validator::make($request->all(), [
                'project_ids.*' => 'required|integer|not_in:0',
                'hours.*' => 'integer|gte:0|lte: 23',
                'minutes.*' => 'integer|gte:0|lte: 59',
            ]);
            if ($validatedData->fails()) {
                return response()->json(['status' => false, 'message' => __('Please, insert project and time .')]);
            }
            $projectIdsLength = count($request['project_ids']);
            // Need to remove all data for current date / user before adding any new data
            $this->clientHourService->removeByDateAndUserId($date, $loggedUser->id);
            $fillData = [];
            for ($item = 0; $item < $projectIdsLength; $item++) {
                $fillData[$item] = [
                    'user_id' => $loggedUser->id,
                    'project_id' => $request['project_ids'][$item],
                    'date' => $date,
                    'time' => $request['hours'][$item] * 3600 + $request['minutes'][$item] * 60,
                ];
            }
            if ($submitted && !empty($fillData)) {
                $this->clientHourService->insert($fillData);
            }
        } else {
            $this->clientHourService->removeByDateAndUserId($date, $loggedUser->id);
        }
        if (!empty($workTimeIds)) {
            if ($isToday) {
                WorkTime::stopStartedWork($loggedUser->id);
            }
            WorkTime::whereIn('id', $workTimeIds)
                ->update([
                    'submitted' => $submitted
                ]);

            $msg = $submitted ? __('day_report_submitted') : __('day_report_reset');

            return response()->json(['status' => true, 'message'=> $msg, 'data' => null]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy($id)
    {
        $item = Work::find($id);

        if(auth()->user()->can('delete', $item))
        {
            $data = $item->delete();
            return response()->json(['status' => true, 'message' => __('The work deleted'), 'data' => $data]);
        }
        return response()->json(['status' => false, 'message' => __('Invalid data'), 'data' => null]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  WorksRemoveWorkTimeRequest  $request
     * @return JsonResponse
     */
    public function removeWorkTime(WorksRemoveWorkTimeRequest $request)
    {
        $item = Work::find($request['work_id']);
        if(auth()->user()->can('delete', $item))
        {
            $workTime = WorkTime::where([
                ['id', '=', $request['work_time_id']],
                ['work_id', '=', $request['work_id']],
            ])->delete();

            if ($workTime) {
                $otherWorkTimeCount = WorkTime::where('work_id', '=', $request['work_id'])->count();
                if ($otherWorkTimeCount === 0) { // removing work if no any work times
                    $item->delete();
                }
                return response()->json(['status' => true, 'message' => __('The work deleted'), 'data' => $workTime]);
            }
            return response()->json(['status' => false, 'message' => __('Invalid work time'), 'data' => null]);

        }
        return response()->json(['status' => false, 'message' => __('Invalid data'), 'data' => null]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  WorksStopRequest  $request
     * @return JsonResponse
     */
    public function stop(WorksStopRequest $request): JsonResponse
    {
        // TODO should we add permission check?
        $loggedUser = auth()->user();
        $requestData = $request->all();
        $workItem = Work::where([
            ['id', '=', $request['work_id']],
            ['user_id', '=', $loggedUser->id],
        ])->first();

        if(empty($workItem)) {
            return response()->json(['status' => false, 'message' => __('Invalid work data'), 'data' => null]);
        }

        if (!$requestData['project_id']) { //if project id is 0
            $requestData['project_id'] = null;
        }

        //if the name of the work or project is changed
        if (($workItem->name !== $requestData['work_name']) || ($workItem->project_id !== $requestData['project_id'])) {
            $changedWork = Work::firstOrCreate(
                [
                    'name' => $requestData['work_name'],
                    'user_id' => $loggedUser->id,
                    'project_id' => $requestData['project_id']
                ]
            );

            if ($changedWork) {
                $willUpdateWorkTime = WorkTime::find($requestData['work_time_id']);
                $willUpdateWorkTime->work_id = $changedWork->id;
                $willUpdateWorkTime->save();
                $requestData['work_id'] = $changedWork->id;
            }

            $otherWorks = WorkTime::where('work_id', $workItem->id)->get();
            if (count($otherWorks) === 0) { //If there are no other tasks with this id, we'll delete this task
                $workItem->delete();
            }
        }

        $workTimeItem = WorkTime::where([
            ['work_id', '=', $requestData['work_id']],
            ['id', '=', $requestData['work_time_id']],
        ])
            ->whereNull('end_date_time')  // I closed this condition because in the DB on end_date_time not null
            ->first();

        if(empty($workTimeItem)) {
            return response()->json(['status' => false, 'message' => __('Invalid workTime data'), 'data' => null]);
        }
        $workTimeItem->end_date_time = Carbon::now()->setTimezone('UTC')->toDateTimeString(); // important
        $workTimeItem->save();

        if ( isset($requestData['tagIds']) && $requestData['tagIds']) {
            $tagsCollection = collect($workTimeItem->tags);
            $existingTags = $tagsCollection->pluck('id')->toArray();
            $tagsToSave = array_diff($requestData['tagIds'], $existingTags);
            $tagsToDelete = array_diff($existingTags, $requestData['tagIds']);

            if ($tagsToSave) {
                $tagIds = $this->tagService->getTagsByIds($tagsToSave)->pluck('id')->toArray();
                WorkTimeTag::addWorkTimeTags($workTimeItem->id, $tagIds);
            }

            if ($tagsToDelete) {
                WorkTimeTag::deleteWorkTimeTags($workTimeItem->id, $tagsToDelete);
            }
        }

        $work = Work::with('workTimes')->where('id', $requestData['work_id'])->first();

        return response()->json(['status' => true, 'message' => __('The work stopped'), 'data' => $work]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  WorksStartNewWorkRequest  $request
     * @return JsonResponse
     */
    public function startNewWork(WorksStartNewWorkRequest $request)
    {
        // TODO should we add permission check?
        $loggedUser = auth()->user();
        $item = Work::where([
            ['id', '=', $request['work_id']],
            ['user_id', '=', $loggedUser->id],
        ])->first();

        if(empty($item)) {
            return response()->json(['status' => false, 'message' => __('Invalid data'), 'data' => null]);
        }

        WorkTime::stopStartedWork($loggedUser->id);

        $time = new WorkTime([
            "work_id" => $item->id,
            "start_date_time" => Carbon::now()->toDateTimeString(),
            "end_date_time" => null, // just now started
        ]);
        $time->save();

        $tagIds = WorkTimeTag::where('work_time_id', '=', $request['work_time_id'])->pluck('tag_id')->toArray();
        if (count($tagIds) > 0) {
            $dataSet = [];
            foreach ($tagIds as $tagId) {
                $dataSet[] = [
                    'work_time_id'  => $time->id,
                    'tag_id'    => $tagId,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];
            }
            WorkTimeTag::insert($dataSet);
        }

        $work = Work::with('workTimes')->where('id', $item->id)->first();

        return response()->json(['status' => true, 'message' => __('The started new work'), 'data' => $work]);
    }

    /**
     * On start action
     *
     * @param  StartWorkFromFullCalendarRequest  $request
     * @return JsonResponse
     */
    public function startWorkFromFullCalendar(StartWorkFromFullCalendarRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if($loggedUser->can('create', $this->workService->getModel())){

            if ($loggedUser->id != $request->user_id) { // TODO user can start self works
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
            }

            $workId = null;
            $nowDateTimeUTC = Carbon::now();
            $projectId = !empty($request->project_id) ? $request->project_id : null;

            $this->workTimeService->stopStartedWork($request->user_id); // Important

            switch ($request->event_type){
                case 'google':
                    $workId = $this->addWorkByName($request->item_name, $request->user_id, $projectId); // important
                    // TODO maybe need to remove google event from google calendar
                    break;
                case 'todos':
                    $todo = $this->todoService->find($request->item_id);
                    if (!empty($todo)) {
                        $workId = $this->addWorkByName($request->item_name, $request->user_id, $projectId); // important
                        // Here need to remove todo_item from list
                        $this->todoService->delete($request->item_id);
                    }
                    break;
                case 'tasks':
                    if($request->item_id){
                        $work = $this->workService->find($request->item_id);
                        if (!empty($work)) {
                            $workId = $work->id; // important
                            $workTime = $this->workTimeService->add([
                                "work_id" => $workId,
                                "start_date_time" => $nowDateTimeUTC,
                                "end_date_time" => null, // just now started
                            ]);
                            if (!empty($request->work_time_id)) {
                                $oldWorkTimeTagIds = $this->workTimeTagService->getTagIdsByWorkTimeId($request->work_time_id);
                                if (!empty($oldWorkTimeTagIds)) {
                                    $this->workTimeTagService->addWorkTimeTags($workTime->id, $oldWorkTimeTagIds);
                                }
                            }

                        }
                    }
                    break;
            }

            $item = !empty($workId) ? $this->workService->find($workId) : null;
            return response()->json(['status' => true, 'message' => __('The work started successfully'), 'data' => $item]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
    }

    /**
     * On start action
     *
     * @param  StopWorkFromFullCalendarRequest  $request
     * @return JsonResponse
     */
    public function stopWorkFromFullCalendar(StopWorkFromFullCalendarRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if($loggedUser->can('create', $this->workService->getModel())) {
            if ($loggedUser->id != $request->user_id) { // TODO user can stop self works
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
            }
            $this->workTimeService->stopWorkByWorkTimeId($request->work_time_id); // Important
            return response()->json([
                'status' => true,
                'message' => __('The work stopped successfully'),
                'data' =>  $this->workService->find($request->work_id)
            ]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
    }

    /**
     * On start action
     *
     * @param  StartWorkFromTodoRequest  $request
     * @return JsonResponse
     */
    public function startWorkFromTodo(StartWorkFromTodoRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if($loggedUser->can('create', $this->workService->getModel())){

            if ($loggedUser->id != $request->user_id) { // TODO user can start self works
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
            }

            $workId = null;
            $projectId = !empty($request->project_id) ? $request->project_id : null;
            $this->workTimeService->stopStartedWork($request->user_id); // Important

            $todo = $this->todoService->find($request->todo_id);
            if (!empty($todo)) {
                $workId = $this->addWorkByName($todo->name, $request->user_id, $projectId); // important
                // Here need to remove todo_item from list
                $this->todoService->delete($request->todo_id);
            }

            $item = !empty($workId) ? $this->workService->find($workId) : null;
            return response()->json(['status' => true, 'message' => __('The work started successfully'), 'data' => $item]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'data' => null]);
    }

    /**
     * On add event action
     *
     * @param  AddEventForFullCalendarRequest  $request
     * @return JsonResponse
     */
    public function addEventForFullCalendar(AddEventForFullCalendarRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if ($loggedUser->id != $request->user_id) { // TODO user can start self works
            return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
        }
        // checking permissions
        if($request->event_type === 'todos'){
            if(!$loggedUser->can('create', $this->todoService->getModel())){
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
            }
        } else { // google
            if(!$loggedUser->can('add google calendar events')){
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
            }
        }

        $item = null;
        switch ($request->event_type){
            case 'google':
                $eventData = [
                    "user_id" => $request->user_id,
                    "item" => $request->item_name,
                    "start_date_time" => $request->start_date_time,
                    "all_day" => (bool)$request->all_day,
                    "end_date_time" => $request->end_date_time,
                    "time_offset" => $loggedUser->time_offset,
                    "description" => ''
                ];
                $item = $this->userService->addGoogleEvent($eventData);
                if (!$item) {
                    return response()->json(['status' => false, 'message' => __('Cannot add google event for now'), 'data' => $item]);
                }
                break;
            case 'todos':
                // Here need to add todo_item from list
                $item = $this->todoService->add([
                    'name' => trim(preg_replace('/\s+/', ' ', $request->item_name)),
                    'user_id' => $request->user_id,
                    'start_date_time' => Carbon::parse($request->start_date_time, $loggedUser->time_offset)->timezone(config('app.timezone')),
                    'end_date_time' => !empty($request->end_date_time) ? Carbon::parse($request->end_date_time, $loggedUser->time_offset)->timezone(config('app.timezone')) : null,
                ]);
                break;
        }

        return response()->json(['status' => true, 'message' => __('The event item added successfully'), 'data' => $item]);
    }

    /**
     * On update event action
     *
     * @param  UpdateEventForFullCalendarRequest  $request
     * @return JsonResponse
     */
    public function updateEventForFullCalendar(UpdateEventForFullCalendarRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if ($loggedUser->id != $request->user_id) { // TODO user can start self works
            return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
        }
        // checking permissions
        if($request->event_type === 'todos'){
            $todo = $this->todoService->find($request->item_id);
            if(!$loggedUser->can('update', $todo)){
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => $request->all()]);
            }
        } else { // google
            if(!$loggedUser->can('edit google calendar events')){
                return response()->json(['status' => false, 'message' => __('Access denied'), 'data' => null]);
            }
        }

        $item = null;
        switch ($request->event_type){
            case 'google':
                $eventData = [
                    "user_id" => $request->user_id,
                    "item" => $request->item_id,
                    "start_date_time" => $request->start_date_time,
                    "all_day" => (bool)$request->all_day,
                    "end_date_time" => $request->end_date_time,
                    "time_offset" => $loggedUser->time_offset,
                    "description" => ''
                ];
                $item = $this->userService->updateGoogleEvent($eventData);
                if (!$item) {
                    return response()->json(['status' => false, 'message' => __('Cannot update google event for now'), 'data' => $item]);
                }
                break;
            case 'todos':
                // Here need to update todo_item from list
                $end_date_time = !empty($request->end_date_time)
                    ? Carbon::parse($request->end_date_time, $loggedUser->time_offset)->timezone(config('app.timezone'))
                    : null;

                if (!$request->all_day && !$end_date_time) {
                    $end_date_time = Carbon::parse($request->start_date_time, $loggedUser->time_offset)->addMinute(30)->timezone(config('app.timezone'));
                }
                $item = $this->todoService->edit([
                    'user_id' => $request->user_id,
                    'start_date_time' => Carbon::parse($request->start_date_time, $loggedUser->time_offset)->timezone(config('app.timezone')),
                    'end_date_time' => $end_date_time,
                ], $request->item_id);
                break;
        }

        return response()->json(['status' => true, 'message' => __('The event item updated successfully'), 'data' => $item]);
    }

    /**
     * @param string $name
     * @param int $userId
     * @param int|null $projectId
     * @return mixed
     */
    private function addWorkByName(string $name, int $userId, int $projectId = null)
    {
        $work = $this->workService->getWorkByName($name, $userId, $projectId);
        if (empty($work)) {
            $work = $this->workService->add([
                'name' => trim($name),
                'user_id' => $userId,
                'project_id' => $projectId,
            ]);
        }
        $this->workTimeService->add([
            "work_id" => $work->id,
            "start_date_time" => Carbon::now(),
            "end_date_time" => null, // just now started
        ]);

        return $work->id;
    }

    private function compareStartEndTimeWithNow($start_date_time, $end_date_time)
    {
        $timeOffset = auth()->user()->time_offset;
        if (!empty($start_date_time) && !WorkTime::compereDateTimeWithNow($start_date_time, $timeOffset)) {
            return __('Invalid Start time');
        }

        if (!empty($end_date_time) && WorkTime::compereDateTimeWithNow($end_date_time, $timeOffset, false)) {
            return __('Invalid End time');
        }

        if (!empty($start_date_time) && !empty($end_date_time) && !WorkTime::compereStartAndEndDateTimes($start_date_time, $end_date_time, $timeOffset)) {
            return __('The Start time is bigger then the End time');
        }

        return null;
    }

    private function compareStartEndTimeWithSelectedDate($start_date_time, $end_date_time, $selectedDate)
    {
        try{
            $timeOffset = auth()->user()->time_offset;
            $startTimeFormat = $selectedDate . ' ' . $start_date_time;
            $endTimeFormat = $selectedDate . ' ' . $end_date_time;
            $today = Carbon::today($timeOffset);
            $start = Carbon::parse($startTimeFormat, $timeOffset);
            $end = Carbon::parse($endTimeFormat, $timeOffset);

            if ($start >= $today) {
                return __('Invalid Start time');
            }

            if ($end >= $today) {
                return __('Invalid End time');
            }

            if ($start >= $end) {
                return __('Invalid End time');
            }
        }catch (\Exception $exception){
            \Log::error($exception->getMessage());
            return __('Invalid dates');
        }
        return null;
    }

    private function _compareEndTimeWithCurrentTime($end_date_time): bool
    {
        try {
            $loggedUser = auth()->user();
            $checkedEndDateTime = Carbon::parse($end_date_time, $loggedUser->time_offset)->setTimezone('UTC');
            $currentDateTime = now()->setTimezone('UTC');
            $compareCurrentAndEndDateTime = Carbon::parse($checkedEndDateTime)->diff(Carbon::parse($currentDateTime));
            if ($compareCurrentAndEndDateTime->invert == 1) {
                return true;
            }
        } catch (\Exception $exception) {
            \Log::error($exception->getMessage());
        }
        return false;
    }
}
