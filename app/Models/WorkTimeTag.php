<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class WorkTimeTag extends Model
{
    protected $table = 'work_times_tags';

    public static function updateWorkTag($work_time_id, $tagIds)
    {
        $nowTime = Carbon::now()->setTimezone('UTC');
        WorkTimeTag::where('work_time_id', $work_time_id)->delete();
        $dataSet = [];
        foreach ($tagIds as $tagId) {
            $dataSet[] = [
                'work_time_id' => $work_time_id,
                'tag_id' => $tagId,
                'created_at' =>$nowTime,
                'updated_at' => $nowTime,
            ];
        }
        WorkTimeTag::insert($dataSet);
    }
    public static function addWorkTimeTags($workTimeId, $tagIds){
        $tags = [];
        $nowTime = Carbon::now()->setTimezone('UTC');
        foreach ($tagIds as $tagId) {
            $tags[] = [
                'work_time_id' => $workTimeId,
                'tag_id' => $tagId,
                'created_at' =>$nowTime,
                'updated_at' => $nowTime,
            ];
        }
        return WorkTimeTag::insert($tags);
    }

    /**
     * delete workTime tags.
     * @param  $workTimeId
     * @param  $tagIds
     * @return mixed
     */
    public static function deleteWorkTimeTags($workTimeId, $tagIds){
        return WorkTimeTag::where('work_time_id', $workTimeId)->whereIn('tag_id', $tagIds)->delete();
    }
}
