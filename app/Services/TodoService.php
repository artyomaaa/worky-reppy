<?php

namespace App\Services;

use App\Repositories\TodoRepository;
use App\Services\Interfaces\TodoServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class TodoService extends BaseService implements TodoServiceInterface
{
    /**
     * TodoService constructor.
     *
     * @param TodoRepository $todoRepository
     */
    public function __construct(TodoRepository $todoRepository)
    {
        parent::__construct($todoRepository);
    }

    /**
     * Get statuses.
     * @return array
     */
    public function getStatuses(): array
    {
        return $this->modelRepository->getStatuses();
    }

    /**
     * Get filtered query.
     * @param $request
     * @param $loggedUser
     * @return Builder
     */
    public function getFilteredQuery($request, $loggedUser): Builder
    {
        $query = $this->modelRepository->getQuery();
        $query->where('user_id', $loggedUser->id); // Important only own todos can see each user

        // filter by user name
        if (!empty($request->name)) {
            $this->modelRepository->addConditionToQuery('name', $request->name, $query, 'like');
        }

        // filter by status
        if (isset($request->statuses)) {
            $status = !is_array($request->statuses) ? [$request->statuses] : $request->statuses;
            $this->modelRepository->addConditionToQuery('status', $status, $query, 'in');
        }

        // filter by created_at
        if (!empty($request->created_at)) {
            $createdAtArr = $request->created_at;
            $fromCreatedAtDate = null;
            $toCreatedAtDate = null;

            if (isset($createdAtArr[0])) {
                $fromCreatedAtDate = Carbon::parse($createdAtArr[0], $loggedUser->time_offset)
                    ->startOfDay()
                    ->timezone('UTC')
                    ->format('Y-m-d H:i:s');
            }

            if (isset($createdAtArr[1])) {
                $toCreatedAtDate = Carbon::parse($createdAtArr[1], $loggedUser->time_offset)
                    ->endOfDay()
                    ->timezone('UTC')
                    ->format('Y-m-d H:i:s');
            }

            if ($fromCreatedAtDate && $toCreatedAtDate) {
                $this->modelRepository->addConditionToQuery('created_at', [$fromCreatedAtDate, $toCreatedAtDate], $query, 'between');
            } else if ($fromCreatedAtDate === null && $toCreatedAtDate) {
                $this->modelRepository->addConditionToQuery('created_at', $toCreatedAtDate, $query, 'normal', '<=');
            } else if ($fromCreatedAtDate && $toCreatedAtDate === null) {
                $this->modelRepository->addConditionToQuery('created_at', $fromCreatedAtDate, $query, 'normal', '>=');
            }
        }

        return $query;
    }

    /**
     * @param Builder $query
     * @param int $pageSize
     * @return LengthAwarePaginator
     */
    public function orderByNameAndPaginate(Builder $query, int $pageSize): LengthAwarePaginator
    {
        return parent::orderByNameAndPaginate($query, $pageSize);
    }

    /**
     * @param Builder $query
     * @param int $pageSize
     * @return LengthAwarePaginator
     */
    public function orderByCreatedAtAndPaginate(Builder $query, int $pageSize): LengthAwarePaginator
    {
        return parent::orderByCreatedAtAndPaginate($query, $pageSize);
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return mixed
     */
    public function getFullCalendarTodos(int $userId, string $start, string $end, string $utcOffset = '+00:00')
    {
        $timezone = Carbon::now($utcOffset)->getTimezone();
        return $this->modelRepository
            ->getFullCalendarTodos($userId, $start, $end)
            ->map(function ($item) use ($timezone) {
                $startDateTime = Carbon::parse($item->start_date_time)->timezone($timezone)->format('Y-m-d H:i:s');
                $endDateTime = !empty($item->end_date_time) ? Carbon::parse($item->end_date_time)->timezone($timezone)->format('Y-m-d H:i:s') : null;
                return [
                    'event_type' => 'todos',
                    'work_id' => $item->work_id,
                    'project_id' => !empty($item->project_id) ? $item->project_id : null,
                    'project_name' => !empty($item->project_name) ? $item->project_name : __('No Project'),
                    'work_duration' => gmdate("H:i", $item->duration),
                    'work_name' => $item->work_name,
                    'work_user_id' => $item->work_user_id,
                    'work_time_id' => null,
                    'description' => $item->task_description,
                    'title' => $item->work_name,
                    'start' => $startDateTime,
                    'end' => $endDateTime,
                    'textColor' => '#ffffff', // default white
                    'backgroundColor' => config('app.calendar_todos_color'),
                    'allDay' => substr($startDateTime, -8) === '00:00:00' && empty($item->end_date_time),
                    'isRunning' => false,
                    'tags' => [],
                ];
            });
    }

    /**
     * @param int $userId
     * @return int
     */
    public function getTotalTodos(int $userId): int
    {
        return $this->modelRepository->getTotalTodos($userId);
    }
}
