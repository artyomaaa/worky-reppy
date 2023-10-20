<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class Dashboard extends Model
{
    public static function getFilteredQuery($startDateTime, $endDateTime, $userIds = [], $projectIds = [])
    {
        $startDateTime = Carbon::parse($startDateTime)->format('Y-m-d H:i:s');
        $endDateTime = Carbon::parse($endDateTime)->format('Y-m-d H:i:s');

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

        if (!empty($userIds)) {
            $query = $query->whereIn('work_user_id', $userIds);
        }

        if ($projectIds && in_array(null, $projectIds, true)) {
            $query->where(function ($q) use ($projectIds) {
                $q->whereNull('project_id');
                $q->orWhereIn('project_id', $projectIds);
            });
        } else if ($projectIds && !in_array(null, $projectIds, true)) {
            $query->whereIn('project_id', $projectIds);
        }

        return $query;
    }
    public static function getItemsByGroupedProjects($startDateTime, $endDateTime, $userIds = [], $projectIds = []): array
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $userIds, $projectIds);

        $items = $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')
            )
            ->groupBy('project_id')
            ->get();
        $total = self::getAllProjectsTotalDuration($startDateTime, $endDateTime, $userIds, $projectIds);

        return ['items' => $items, 'totalDuration' => $total->total_duration];
    }

    public static function getItemsForBarChart($startDateTime, $endDateTime, $userIds = [], $projectIds = []): array
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $userIds, $projectIds);

        $items = $query
            ->select(
                'reports_view.*',
                \DB::raw('CASE WHEN reports_view.project_id IS NULL THEN 0
                    ELSE reports_view.project_id
                    END
                    as project_id')
            )
            ->groupBy('start_date_time')
            ->get();
        $total = self::getAllProjectsTotalDuration($startDateTime, $endDateTime, $userIds, $projectIds);

        return ['items' => $items, 'totalDuration' => $total->total_duration];
    }
    public static function getProjectsTotalDuration($startDateTime, $endDateTime, $userIds = [], $projectIds = [])
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $userIds, $projectIds);

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
                \DB::raw('SUM(((SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time))))) as total_duration')
            )
            ->groupBy('project_id')
            ->get();
    }
    public static function getDurationDatas($startDateTime, $endDateTime, $userIds = [], $projectIds)
    {
        $query = self::getFilteredQuery($startDateTime, $endDateTime, $userIds, $projectIds);

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
               'reports_view.duration'
            )
            ->groupBy('start_date_time')
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
    public static function getActivities($userIds) {
        $query = \DB::table('reports_view');
        if (!empty($userIds)) {
            $query = $query->whereIn('work_user_id', $userIds);
        };

        $query->where(function ($q) {
            $q->where(function($q2) {
                $q2->whereNull('end_date_time');
            });
            $q->orWhere(function ($q1) {
                $q1->whereNotNull('end_date_time');
            });
        });
        $activities = $query->select(
                'reports_view.*',
                \DB::raw('
                    CASE WHEN reports_view.end_date_time IS NULL THEN 0
                        ELSE TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.end_date_time))
                    END
                    as calculated_duration
                ')
            )
            ->orderBy('calculated_duration', 'asc')
            ->get()
            ->unique('work_user_id');

        return $activities;
    }
    public static function getMostTrackedWorks($userId) {
        $items = \DB::table('reports_view')
            ->where('work_user_id', $userId)
            ->select(
                'reports_view.work_id',
                'reports_view.work_time_id',
                'reports_view.work_name',
                'reports_view.project_name',
                'reports_view.start_date_time',
                'reports_view.end_date_time',
                'reports_view.project_color',
                'reports_view.project_id',
                'work_times_tags.tag_id as tagIds',
                \DB::raw('SUM(
                    CASE WHEN reports_view.end_date_time IS NULL THEN TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.start_date_time))
                        ELSE TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time))
                    END)
                    as total_duration'
                )
            )->leftJoin('work_times_tags', 'work_times_tags.work_time_id', '=', 'reports_view.work_time_id')
            ->groupBy('work_id')
            ->limit(9)
            ->orderBy('total_duration', 'DESC')
            ->get();

        $workIds = Arr::pluck($items, 'work_id');

        $notFinishedItems = \DB::table('reports_view')
            ->where('work_user_id', $userId)
            ->whereNull('end_date_time')
            ->whereIn('work_id', $workIds)
            ->select(
                'reports_view.work_id',
                'reports_view.work_time_id',
                'reports_view.start_date_time'
            )
            ->get();

        if (empty($notFinishedItems)) {
            return $items;
        }

        $res = [];
        foreach ($items as $item){
            foreach ($notFinishedItems as $notFinishedItem){
                if ($item->work_id === $notFinishedItem->work_id) {
                    $item->start_date_time = $notFinishedItem->start_date_time;
                    $item->end_date_time = null;
                    $item->work_time_id =  $notFinishedItem->work_time_id;
                    break;
                }
            }
            $res[] = $item;
        }
        return $res;
    }
}
