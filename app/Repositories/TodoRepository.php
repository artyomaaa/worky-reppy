<?php

namespace App\Repositories;

use App\Models\Todo;
use App\Repositories\Interfaces\TodoRepositoryInterface;
use Carbon\Carbon;

class TodoRepository extends BaseRepository implements TodoRepositoryInterface
{
    /**
     * TodoRepository constructor.
     *
     * @param Todo $model
     */
    public function __construct(Todo $model)
    {
        parent::__construct($model);
    }

    /**
     * Get statuses.
     * @return array
     */
    public function getStatuses(): array
    {
        return [$this->model::INACTIVE, $this->model::ACTIVE, $this->model::ARCHIVED];
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @return mixed
     */
    public function getFullCalendarTodos(int $userId, string $start, string $end)
    {
        return $this->model
            ->leftJoin('projects', 'todos.project_id', '=', 'projects.id')
            ->where('todos.user_id', '=', '?')
            ->where('todos.start_date_time', '>=', '?')
            ->whereRaw('IF (`todos`.`end_date_time` IS NULL, `todos`.`start_date_time`, `todos`.`end_date_time`) <= ?')
            ->setBindings([$userId, $start, $end])
            ->selectRaw('
                todos.id AS work_id,
                todos.name AS work_name,
                todos.start_date_time,
                todos.end_date_time,
                todos.user_id as work_user_id,
                todos.description as task_description,
                projects.id as project_id,
                projects.name as project_name,
                projects.color as project_color,
                (CASE
                   WHEN `todos`.`start_date_time` IS NULL OR `todos`.`end_date_time` IS NULL THEN 0
                   ELSE TIME_TO_SEC(TIMEDIFF(`todos`.`end_date_time`, `todos`.`start_date_time`))
                   END
                ) as duration
           ')
            ->get();
    }

    /**
     * @param int $userId
     * @return int
     */
    public function getTotalTodos(int $userId): int
    {
        return $this->model->where('user_id', '=', $userId)->count();
    }
}
