<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Report extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];


    public static function selectItemsGroupByProjects($items)
    {
        $_items = [];
        foreach ($items as $item) {
            $project_id = !empty($item->project_id) ? $item->project_id : 0;

            if (!isset($_items[$project_id]['project'])) {
                $_items[$project_id]['project'] = [
                    'project_id' => $item->project_id,
                    'project_name' => $item->project_name,
                    'project_description' => $item->project_description,
                    'project_color' => $item->project_color,
                    'project_status' => $item->project_status,
                    'project_user_id' => $item->project_user_id,
                    'project_user_name' => $item->project_user_name,
                    'project_user_status' => $item->project_user_status
                ];
            }

            $_items[$project_id]['works'][] = [
                'work_id' => $item->work_id,
                'work_name' => $item->work_name,
                'work_user_id' => $item->work_user_id,
                'work_user_name' => $item->work_user_name,
                'work_user_status' => $item->work_user_status,
                'work_time_id' => $item->work_time_id,
                'start_date_time' => $item->start_date_time,
                'end_date_time' => $item->end_date_time,
                'duration' => $item->duration,
            ];
        }

        return $_items;
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param array $projectIds
     * @param array $userIds
     * @param bool $projectStatus
     * @param bool $projectType
     * @return mixed
     */
    public static function getFilteredQuery($startDateTime, $endDateTime, array $projectIds = [], array $userIds = [], bool $projectStatus = false, bool $projectType = false)
    {
        $query = \DB::table('reports_view')
            ->where('start_date_time', '>=', $startDateTime)
            ->where(function ($q) use($endDateTime) {
                $q->where(function ($q1) use($endDateTime) {
                    $q1->whereNotNull('end_date_time');
                    $q1->where('end_date_time', '<=', $endDateTime);
                });

                $q->orWhere(function($q2) use($endDateTime) {
                    $q2->whereNull('end_date_time');
                    $q2->where(\DB::raw('NOW()'), '<=', $endDateTime);
                });
            });

        if(!empty($projectIds)){
            if (in_array(0, $projectIds)) { // this means get "No Project" items too
                $query = $query->where(function ($q) use($projectIds) {
                    $q->whereNull('project_id');
                    $q->orWhereIn('project_id', $projectIds);
                });
            }else{
                $query = $query->whereIn('project_id', $projectIds);
            }
        }

        if (!empty($userIds)) {
            $query = $query->whereIn('work_user_id', $userIds);
        }

        if ($projectStatus === '0' ||  $projectStatus === '1') {
            $query = $query->where('project_status', $projectStatus);
        }

        if ($projectType) {
            $query = $query->where('project_type', $projectType);
        }

        return $query;
    }

    public static function getQuery($startDateTime, $endDateTime, $projectIds = [])
    {
        $startDateTime = Carbon::parse($startDateTime)->format('Y-m-d H:i:s');
        $endDateTime = Carbon::parse($endDateTime)->format('Y-m-d H:i:s');

        $query = \DB::table('reports_view')
            ->where('start_date_time', '>=', $startDateTime)
            ->where(function ($q) use ($endDateTime) {
                $q->where(function ($q1) use ($endDateTime) {
                    $q1->whereNotNull('end_date_time');
                    $q1->where('end_date_time', '<=', $endDateTime);
                });

                $q->orWhere(function ($q2) use ($endDateTime) {
                    $q2->whereNull('end_date_time');
                    $q2->where(\DB::raw('NOW()'), '<=', $endDateTime);
                });
            });

        if (!empty($projectIds)) {
            if (in_array(0, $projectIds)) { // this means get "No Project" items too
                $query = $query->where(function ($q) use ($projectIds) {
                    $q->whereNull('project_id');
                    $q->orWhereIn('project_id', $projectIds);
                });
            } else {
                $query = $query->whereIn('project_id', $projectIds);
            }
        }


        return $query;
    }

    public static function getProjectFilteredQuery($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $startDateTime = Carbon::parse($startDateTime)->format('Y-m-d H:i:s');
        $endDateTime = Carbon::parse($endDateTime)->format('Y-m-d H:i:s');

        $query = \DB::table('reports_view')
            ->where('start_date_time', '>=', $startDateTime)
            ->where(function ($q) use ($endDateTime) {
                $q->where(function ($q1) use ($endDateTime) {
                    $q1->whereNotNull('end_date_time');
                    $q1->where('end_date_time', '<=', $endDateTime);
                });

                $q->orWhere(function ($q2) use ($endDateTime) {
                    $q2->whereNull('end_date_time');
                    $q2->where(\DB::raw('NOW()'), '<=', $endDateTime);
                });
            });

        if (!empty($projectIds)) {
            if (in_array(0, $projectIds)) { // this means get "No Project" items too
                $query = $query->where(function ($q) use ($projectIds) {
                    $q->whereNull('project_id');
                    $q->orWhereIn('project_id', $projectIds);
                });
            } else {
                $query = $query->whereIn('project_id', $projectIds);
            }
        }

        if (!empty($userIds)) {
            $query = $query->whereIn('work_user_id', $userIds);
        }

        return $query;
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param array $projectIds
     * @param array $userIds
     * @return array
     */
    public static function getItems($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')
            )
            ->get();
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param array $projectIds
     * @param array $userIds
     * @return array
     */
    public static function getItemsByGroupedProjects($startDateTime, $endDateTime, array $projectIds = [], array $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')
            )
            ->groupBy('project_id')
            ->get();
    }

    public static function getAllProjectsTotalDuration($startDateTime, $endDateTime, $userIds, $projectIds){
        $queryTotal = self::getFilteredQuery($startDateTime, $endDateTime, $userIds, $projectIds);
        return $queryTotal
            ->select(
                \DB::raw('SUM(((SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time))))) as total_duration')
            )
            ->first();
    }

    public static function getGroupedProjects($startDateTime, $endDateTime, $projectStatus, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds, $projectStatus);
        return $query
            ->select(
                'reports_view.work_id as id',
                'reports_view.project_id',
                'reports_view.work_user_id',
                'reports_view.project_id',
                'reports_view.project_name',
                'reports_view.project_status',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')
            )
            ->groupBy('project_id')
            ->get();
    }

    public static function getItemsByGroupedForBarChart($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')
            )
            ->groupBy('start_date_time')
            ->get();
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param array $projectIds
     * @param array $userIds
     * @return array
     */
    public static function getProjectGroupedWorkList($startDateTime, $endDateTime, $projectIds, $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id'),
                \DB::raw('SUM((
                   CASE
                       WHEN reports_view.end_date_time IS NULL THEN (SELECT TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.start_date_time)) as duration)
                       ELSE (SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time)) as duration)
                       END
                   )) as total_duration')
            )
            ->groupBy('work_id')
            ->get();
    }

    public static function getProjectGroupedMemberList($startDateTime, $endDateTime, $projectIds, $userIds)
    {
        $query = self::getProjectFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);
        $arr = [];
        $getProjectList = $query->get();
        foreach ($getProjectList as $key => $val) {
            array_push($arr, $val->work_user_id);
        }

        $projectsOfUsers = User::join('reports_view', 'users.id', '=', 'reports_view.work_user_id')
            ->select('reports_view.project_name', 'reports_view.project_id', 'users.*',
                \DB::raw('SUM((
                   CASE
                       WHEN reports_view.end_date_time IS NULL THEN (SELECT TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.start_date_time)) as duration)
                       ELSE (SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time)) as duration)
                       END
                   )) as total_duration'))
            ->whereIn('reports_view.project_id', $projectIds[0])
            ->whereBetween('reports_view.start_date_time', [$startDateTime, $endDateTime])->groupBy('users.id')
            ->groupBy('reports_view.project_name')->get();

        $members = User::join('works', 'users.id', '=', 'works.user_id')
            ->join('work_times', 'works.id', '=', 'work_times.work_id')
            ->select(
                'users.id',
                'users.name',
                'users.surname',
                'users.patronymic',
                'works.project_id',
                \DB::raw('SUM((
                   CASE
                       WHEN work_times.end_date_time IS NULL THEN (SELECT TIME_TO_SEC(TIMEDIFF(NOW(), work_times.start_date_time)) as duration)
                       ELSE (SELECT TIME_TO_SEC(TIMEDIFF(work_times.end_date_time, work_times.start_date_time)) as duration)
                       END
                   )) as total_duration')
            )
            ->where('works.project_id', '=', $projectIds)
            ->whereBetween('work_times.start_date_time', [$startDateTime, $endDateTime])
            ->groupBy('works.project_id')
            ->get();
        return ['members' => $members, 'projectsOfUsers' => $projectsOfUsers];
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param array $projectIds
     * @param array $userIds
     * @return array
     */
    public static function getProjectsTotalDuration($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id'),
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN "No Project"
                    ELSE reports_view.project_name
                    END
                    as project_name'),
                'reports_view.project_color',
                'reports_view.project_price',
                'reports_view.project_price_currency',
                'reports_view.project_type',
                \DB::raw('SUM((
                   CASE
                       WHEN reports_view.end_date_time IS NULL THEN (SELECT TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.start_date_time)) as duration)
                       ELSE (SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time)) as duration)
                       END
                   )) as total_duration')
            )
            ->groupBy('project_id')
            ->get();
    }

    public static function getTotalDurationForEveryProjects($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getProjectFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id'),
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN "No Project"
                    ELSE reports_view.project_name
                    END
                    as project_name'),
                'reports_view.project_color',
                'reports_view.project_price',
                'reports_view.project_price_currency',
                'reports_view.project_type',
                'reports_view.project_status',
                \DB::raw('SUM((
                   CASE
                       WHEN reports_view.end_date_time IS NULL THEN (SELECT TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.start_date_time)) as duration)
                       ELSE (SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time)) as duration)
                       END
                   )) as total_duration')
            )
            ->groupBy('project_id')
            ->get();
    }

    public static function getProjectsTotalDurationForBarChart($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        return $query
            ->select(
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id'),
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN "No Project"
                    ELSE reports_view.project_name
                    END
                    as project_name'),
                'reports_view.project_color',
                'reports_view.duration as total_duration'
            )
            ->groupBy('start_date_time')
            ->get();
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param array $projectIds
     * @param array $userIds
     * @return array
     */
    public static function getProjectsGroupedWorksCount($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        $sql = $query->select('reports_view.work_id',
            \DB::raw('
            CASE WHEN reports_view.project_id IS NULL THEN 0
            ELSE reports_view.project_id
            END
            as project_id')
        )
        ->groupBy('work_id')
        ->fullSql();

        return \DB::select('SELECT COUNT(pw.project_id) as works_count, pw.project_id FROM ( ' . $sql . ' ) AS pw GROUP BY pw.project_id');
    }

    public static function getProjectsGroupedMembersCount($startDateTime, $endDateTime, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);

        $sql = $query->select('reports_view.work_user_id',
            \DB::raw('
            CASE WHEN reports_view.project_id IS NULL THEN 0
            ELSE reports_view.project_id
            END
            as project_id')
        )
            ->groupBy('work_user_id')
            ->groupBy('project_id')
            ->fullSql();
        return \DB::select('SELECT COUNT(pw.project_id) as members_count, pw.project_id FROM ( ' . $sql . ' ) AS pw GROUP BY pw.project_id');
    }

    public static function getItemsDetails($startDateTime, $endDateTime, $projectIds = [], $userIds = [], $pageSize = 0)
    {
        $items = [];

        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);
        $queryTotal = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds);
        $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')

            );
        $items = $pageSize ? $query->paginate($pageSize) : $query->orderBy('work_id', 'DESC')->get();

        $total = $queryTotal
            ->select(
                \DB::raw('SUM(((SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time))))) as total_duration')
            )
            ->first();

        return ['items' => $items, 'totalDuration' => $total->total_duration];
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param $projectStatus
     * @param $projectType
     * @param array $projectIds
     * @param array $userIds
     * @return Collection
     */
    public static function getFinancialItems($startDateTime, $endDateTime, $projectStatus, $projectType, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds, $projectStatus, $projectType);
        $query
            ->select(
                'reports_view.project_name',
                'reports_view.project_id',
                'reports_view.project_status',
                'reports_view.project_type',
                'reports_view.duration',
                'reports_view.work_user_name',
                'reports_view.work_user_id',
                'reports_view.work_user_type',
                'reports_view.user_salary',
                'reports_view.project_price',
                'reports_view.project_price_currency',
            )
            ->whereNotNull('project_name')
            ->whereNotNull('end_date_time');

        return $query->get()->groupBy('project_name');
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param $projectStatus
     * @param $projectType
     * @param array $projectIds
     * @param array $userIds
     * @return Collection
     */
    public static function getSummaryItems($startDateTime, $endDateTime, $projectStatus, $projectType, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds, $projectStatus, $projectType);
        $query
            ->select(
                'reports_view.project_name',
                'reports_view.project_id',
                'reports_view.project_status',
                'reports_view.project_type',
                'reports_view.duration',
                'reports_view.work_user_name',
                'reports_view.work_user_id',
                'reports_view.work_user_type',
                'reports_view.work_name'
            )
            ->whereNotNull('end_date_time');

        return $query->get()->groupBy('project_name');
    }

    /**
     * @param $startDateTime
     * @param $endDateTime
     * @param $projectStatus
     * @param $projectType
     * @param array $projectIds
     * @param array $userIds
     * @return Collection
     */
    public static function getDetailsItems($startDateTime, $endDateTime, $projectStatus, $projectType, $projectIds = [], $userIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $userIds, $projectStatus, $projectType);
        $query
            ->select(
                'reports_view.project_name',
                'reports_view.project_price',
                'reports_view.project_price_currency',
                'reports_view.project_id',
                'reports_view.duration',
                'reports_view.start_date_time',
                'reports_view.end_date_time',
                'reports_view.user_salary',
                'reports_view.work_user_name',
                'reports_view.work_user_id',
                'reports_view.work_user_type',
                'reports_view.work_name',
                'reports_view.work_time_id'
            )
            ->whereNotNull('end_date_time');

        return $query->get();
    }

    public static function getUserReportItems($loggedUser, $startDateTime, $endDateTime, $projectIds = [], $selectedUserIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $projectIds, $selectedUserIds);

        $query->select(
            'reports_view.project_name',
            'reports_view.project_id',
            'reports_view.duration',
            'reports_view.work_user_name',
            'reports_view.work_user_id',
            'reports_view.work_user_type'
        );

        $groupedByUserName = $query->get()->groupBy('work_user_id');
        if ($loggedUser->can('view user report full list') || $loggedUser->hasLowestPriorityRole(true)) {
            $countTotalOfProject = User::join('reports_view', 'users.id', '=', 'reports_view.work_user_id')
                ->select('reports_view.project_name', 'reports_view.project_id', 'reports_view.duration', 'users.*')
                ->whereIn('reports_view.work_user_id', $selectedUserIds)
                ->whereBetween('reports_view.start_date_time', [$startDateTime, $endDateTime])
                ->groupBy('users.id')
                ->groupBy('reports_view.project_name')
                ->get();
        } else {
            $countTotalOfProject = User::join('reports_view', 'users.id', '=', 'reports_view.work_user_id')
                ->select('reports_view.project_name', 'reports_view.project_id', 'reports_view.duration', 'users.*')
                ->whereIn('reports_view.work_user_id', $selectedUserIds)
                ->whereIn('reports_view.project_id', $projectIds)
                ->whereBetween('reports_view.start_date_time', [$startDateTime, $endDateTime])
                ->groupBy('users.id')
                ->groupBy('reports_view.project_name')->get();
        }

        return ['groupedByUserName' => $groupedByUserName, 'projectsTotalCount' => $countTotalOfProject];
    }
}
