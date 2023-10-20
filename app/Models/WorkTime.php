<?php

namespace App\Models;

use Carbon\Carbon;

class WorkTime extends BaseModel
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'work_times_tags', 'work_time_id', 'tag_id')
            ->withPivot('work_time_id', 'tag_id');
    }

    /**
     * Get the work.
     */
    public function work()
    {
        return $this->belongsTo(Work::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @param $date
     * @param $timeOffset
     * @param bool $isSmallFromNow
     * @return bool
     */
    public static function compereDateTimeWithNow($date, $timeOffset, $isSmallFromNow = true)
    {
        return $isSmallFromNow ? Carbon::parse($date, $timeOffset)->timezone('UTC') < Carbon::now($timeOffset)->timezone('UTC') : Carbon::parse($date, $timeOffset)->timezone('UTC') > Carbon::now($timeOffset)->timezone('UTC');
    }

    /**
     * @param $start
     * @param $end
     * @param $timeOffset
     * @return bool
     */
    public static function compereStartAndEndDateTimes($start, $end, $timeOffset)
    {
        return Carbon::parse($start, $timeOffset)->timezone('UTC') <= Carbon::parse($end, $timeOffset)->timezone('UTC');
    }

    /**
     * Get started works by user ids
     * @param $user_ids
     * @param $whereField
     * @param $date
     * @return mixed
     */
    public static function getWorkTimesByUserIds($user_ids, $whereField, $date = null)
    {
        $query = self::join('works', 'work_times.work_id', '=', 'works.id')
            ->select('work_times.*', 'works.user_id')
            ->whereIn('works.user_id', $user_ids);

        switch ($whereField) {
            case 'end_date_time':
                $query->whereNull('work_times.end_date_time');
                break;
            case 'duration':
                $query->where('work_times.duration', '0');
                break;
            case 'submitted':
                if ($date) {
                    $query->where('work_times.created_at', '<=', $date);
                }
                $query->where('work_times.submitted', '0');
                break;
        }
        return $query->get();
    }

    /**
     * @param int $workTimeId
     * @return mixed
     */
    public static function stopWorkByWorkTimeId(int $workTimeId)
    {
        $startedWorkTime = self::find($workTimeId);
        $startedWorkTime->end_date_time = Carbon::now()->addSeconds(-1);
        $startedWorkTime->save();
        return $startedWorkTime;
    }

    public static function stopStartedWork($user_id)
    {
        $startedWork = Work::getStartedWorkByUserId($user_id);
        if(!empty($startedWork)){
            self::stopWorkByWorkTimeId($startedWork->work_time_id);
        }
    }

    public function save(array $options = [])
    {
        // before save code
        $this->attributes['duration'] = $this->calculateDurationInSeconds();

        parent::save($options);
        // after save code
    }

    public function calculateDurationInSeconds()
    {
        if (!empty($this->attributes['end_date_time'])) {
            $end_date_time = Carbon::parse($this->attributes['end_date_time']);
            $start_date_time = Carbon::parse($this->attributes['start_date_time']);
            $duration = $end_date_time->diffInRealSeconds($start_date_time); // seconds
        } else {
            $duration = 0; // seconds
        }

        return $duration;
    }

    public static function updateStartEndWorkTime($ongoingTask, $workId, $workTimeId, $description, $startDateTime, $endDateTime = null)
    {
        $workTime = WorkTime::where('id', $workTimeId)->where('work_id', $workId)->first();
        if ($ongoingTask) {
            $workTime->description = $description;
        } else {
            $timeOffsetConvertedStartDateTime = Carbon::parse($startDateTime);
            $timeOffsetConvertedEndDateTime = Carbon::parse($endDateTime);
            if ($workTime->start_date_time !== $timeOffsetConvertedStartDateTime) {
                $workTime->start_date_time = $timeOffsetConvertedStartDateTime;
            }
            if ($endDateTime && $workTime->end_date_time !== $timeOffsetConvertedEndDateTime) {
                $workTime->end_date_time = $timeOffsetConvertedEndDateTime;
            }
            $workTime->duration = $endDateTime ? $timeOffsetConvertedEndDateTime->diffInSeconds($timeOffsetConvertedStartDateTime) : 0;
            $workTime->description = $description;
        }
        $workTime->save();
        $work = Work::with('workTimes')->where('id', $workId)->first();
        return $work ? $work : null;
    }
    public static function mergeWorkTime($workId, $workTimeId, $userId, $checkingItemId, $description , $startDateTime, $endDateTime = null, $duration = 0)
    {
        $item = Work::where('id', $workId)->where('user_id', $userId)->first();
        $workTime = self::where([
            ['work_id', '=', $item->id],
            ['id', '=', $workTimeId],
        ])->first();
        if(!empty($workTime)) {
            // Need to remove old item
            if ($workTime->delete()) {
                $otherWorkTimeItem =  self::where('work_id', '=', $item->id)->first(['id']);
                if(empty($otherWorkTimeItem)) { // Need to remove Work row from works table
                    $item->delete();
                }
                // Now we can add work time for $checkingItem work
                $workTime = new self();
                $workTime->work_id = $checkingItemId;
                $workTime->description = $description;
                $workTime->start_date_time = $startDateTime;
                $workTime->end_date_time = $endDateTime;
                $workTime->duration = $duration;
                $workTime->save();

                return $workTime;
            }
        }
        return null;
    }
}
