<?php

namespace App\Http\Controllers;

use App\Http\Requests\TodosListRequest;
use App\Http\Requests\TodosStoreRequest;
use App\Http\Requests\TodosUpdateRequest;
use App\Services\Interfaces\TodoServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodosController extends Controller
{
    /**
     * @var TodoServiceInterface
     */
    private $todoService;

    /**
     * TodosController constructor.
     * @param TodoServiceInterface $todoService
     */
    public function __construct(
        TodoServiceInterface $todoService
    ) {
        $this->todoService = $todoService;
    }

    /**
     * @param TodosListRequest $request
     * @return JsonResponse
     */
    public function list(TodosListRequest $request): JsonResponse
    {
        $pageSize = isset($request->pageSize) ? $request->pageSize : config('app.default_per_page');
        $loggedUser = $request->user();
        $itemsQuery = null;
        $todos = [];
        if($loggedUser->can('viewAny', $this->todoService->getModel())){
            $itemsQuery = $this->todoService->getFilteredQuery($request, $loggedUser);
            if ($itemsQuery !== null) {
                $todos = $this->todoService->orderByCreatedAtAndPaginate($itemsQuery, $pageSize);
            }
        }

        return response()->json(['status' => true, 'message' => __('getting_todos'), 'todos' => $todos]);
    }

    /**
     * @param TodosStoreRequest $request
     * @return JsonResponse
     */
    public function store(TodosStoreRequest $request): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('create', $this->todoService->getModel())) { // here is working the TodoPolicy
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'todo' => null]);
        }

        if (!empty($request['status']) && !in_array($request['status'], $this->todoService->getStatuses())) {
            return response()->json(['status' => false, 'message' => __('invalid_todo_data'), 'todo' => null]);
        }

        $item = $this->todoService->add([
            'name' => trim(preg_replace('/\s+/', ' ', $request['name'])),
            'description' => isset($request['description']) ? $request['description'] : null,
            'user_id' => isset($request['user_id']) ? $request['user_id'] : $loggedUser->id,
            'project_id' => isset($request['project_id']) ? $request['project_id'] : null,
            'start_date_time' => isset($request['start_date_time']) ? $request['start_date_time'] : Carbon::today()->startOfDay(),
            'end_date_time' => isset($request['end_date_time']) ? $request['end_date_time'] : null,
            'status' => isset($request['status']) ? $request['status'] : $this->todoService->getModel()::ACTIVE,
        ]);
        if ($item) {
            return response()->json(['status' => true, 'message'=> __('The todo added successfully'), 'todo' => $item]);
        }
        return response()->json(['status' => false, 'message'=> __('Something went wrong'), 'todo' => null]);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->todoService->find($id);
        if (!auth()->user()->can('view', $item)) { // here is working the TodoPolicy
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'todo' => null]);
        }
        return response()->json(['status' => false, 'message'=> __('getting_todo'), 'todo' => $item]);
    }

    /**
     * @param TodosUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(TodosUpdateRequest $request, int $id): JsonResponse
    {
        $loggedUser = $request->user();
        $item = $this->todoService->find($id);

        if (!$loggedUser->can('update', $item)) {
            return response()->json(['status' => false, 'message'=> __('Access denied'), 'todo' => null]);
        }

        $data['name'] = trim(preg_replace('/\s+/', ' ', $request['name']));
        if (isset($request['description']))        $data['description'] = $request['description'];
        if (isset($request['user_id']))            $data['user_id'] = $request['user_id'];
        if (isset($request['project_id']))         $data['project_id'] = $request['project_id'];
        if (isset($request['start_date_time']))    $data['start_date_time'] = $request['start_date_time'];
        if (isset($request['end_date_time']))      $data['end_date_time'] = $request['end_date_time'];
        if (isset($request['status']))             $data['status'] = $request['status'];

        $updated = $this->todoService->edit($data, $id);

        return response()->json(['status' => true, 'message'=> __('The todo updated successfully'), 'updated' => $updated]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $item = $this->todoService->find($id);

        if(!auth()->user()->can('delete', $item)) {
            return response()->json(['status' => false, 'message' => __('Access denied'), 'todo' => null]);
        }
        if ($this->todoService->delete($id)) {
            return response()->json(['status' => true, 'message' => __('The todo deleted successfully'), 'deleted' => true]);
        }

        return response()->json(['status' => false, 'message' => __('Something went wrong'), 'deleted' => false]);
    }

    /**
     * get todos count
     * @param Request $request
     * @return JsonResponse
     */
    public function totalTodos(Request $request): JsonResponse
    {
        try {
            $loggedUser = $request->user();
            $totalTodos = $this->todoService->getTotalTodos($loggedUser->id);
            return response()->json(['status' => true, 'message' => __('Getting todos total'), 'totalTodos' => $totalTodos]);
        } catch (\Exception $exception) {
            return response()->json(['status' => false, 'message' => __('Something went wrong'), 'totalTodos' => null]);
        }
    }
}
