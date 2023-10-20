<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get work times
     */
    public function workTimes()
    {
        return $this->hasMany(WorkTime::class);
    }

    /**
     * Get the user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get today works query.
     * @param $user_id
     * @param $startDateTime
     * @param $endDateTime
     * @return mixed
     */
    public static function getTodayWorksQuery($user_id, $startDateTime, $endDateTime)
    {
        return self::leftJoin('projects', 'projects.id', '=', 'works.project_id')
            ->leftJoin('work_times', 'works.id', '=', 'work_times.work_id')
            ->select(
                'works.*',
                'projects.name as project_name', 'projects.color as project_color',
                'work_times.id as work_time_id',
                'work_times.start_date_time',
                'work_times.end_date_time',
                'work_times.duration',
                'work_times.submitted',
                'work_times.description'
            )
            ->where('works.user_id', $user_id)
            ->whereBetween('work_times.start_date_time', [$startDateTime, $endDateTime])
            ->orderBy('work_times.start_date_time', 'desc')
            ->orderBy('work_times.end_date_time', 'desc');
    }

     /**
     * Get started work
     * @param $user_id
     * @return mixed
     */
    public static function getStartedWorkByUserId($user_id)
    {
        $query = self::join('work_times', 'works.id', '=', 'work_times.work_id')
            ->select('works.*', 'work_times.id as work_time_id', 'work_times.start_date_time', 'work_times.end_date_time' )
            ->where('works.user_id', '=', $user_id)
            ->whereNull('work_times.end_date_time');
        return $query->first();
    }
    public static function updateWorkFields($workName, $workProjectId, $workUserId, $workDescription, $workTimeId, $workId){
        $newWork = [
            "name" => $workName,
            "project_id" => $workProjectId,
            "user_id" => $workUserId,
            "description" => $workDescription
        ];
        $newWorkId = self::insertGetId($newWork);
        $work = self::where('id', $newWorkId)->first();
        $workTime = WorkTime::where('id', $workTimeId)->where('work_id', $workId)->first();
        WorkTime::where('id', $workTime['id'])->update(['work_id' => $work->id]);
        $checkWorkTime = WorkTime::where('work_id', '=', $workId)->count();
        if (!$checkWorkTime) {
            self::where('id', '=', $workId)->delete();
        }
        return $work;
    }
    public static function getWorkByName($name, $userId, $projectId = null){
        $checkingItemQuery = Work::where([
            ['user_id', '=', $userId],
            ['name', '=', trim($name)],
        ]);

        if (!empty($projectId)) {
            $checkingItemQuery = $checkingItemQuery->where('project_id', $projectId);
        } else {
            $checkingItemQuery = $checkingItemQuery->whereNull('project_id');
        }

        return $checkingItemQuery->first();
    }

    public static function getAllWorks($value, $ids)
    {
        if ($value) {
            $loggedUser = auth()->user();
            if ($loggedUser->can('view works')) {
                $worksQuery = Work::join('work_times', 'works.id', '=', 'work_times.work_id')
                    ->leftJoin('projects', 'projects.id', '=', 'works.project_id')
                    ->select(
                        'works.*',
                        'projects.name as project_name',
                        'projects.color as project_color',
                        'work_times.id as work_time_id'
                    )
                    ->groupBy('works.name')
                    ->groupBy('projects.id')
                    ->groupBy('works.id')
                    ->orderBy('work_times.created_at','desc')
                    ->where('works.user_id', $loggedUser->id)
                    ->where(function ($q) use ($ids) {
                        $q->whereIn('projects.id', $ids)
                            ->orWhereNull('projects.id');
                    });

                $allWorks = $worksQuery->get();
                $works = [];
                foreach ($allWorks as $item) {
                    if (strpos(mb_strtolower($item->name), mb_strtolower($value)) !== false) {
                        array_push($works, $item);
                    }
                }
                $workTimesIds = Work::join('work_times', 'works.id', '=', 'work_times.work_id')
                    ->where('works.user_id', $loggedUser->id)
                    ->where('works.name', 'like', '%' . $value . '%')
                    ->pluck('work_times.id');
                $allWorkTimeTags = WorkTimeTag::whereIn('work_time_id', $workTimesIds)
                    ->join('tags', 'tags.id', '=', 'work_times_tags.tag_id')
                    ->select(
                        'tags.id as tag_id',
                        'tags.name as tags_name',
                        'tags.color as tags_color',
                        'work_times_tags.work_time_id as work_times_tags_id'
                    )->get()->toArray();
                return ['foundTasks' => $works, 'foundTasksTags' => $allWorkTimeTags];
            }
        }
    }
}
