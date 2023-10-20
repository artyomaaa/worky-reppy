<?php

namespace App\Console\Commands;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Models\WorkTime;
use Illuminate\Support\Facades\Log;

class StopAllWorks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stop:AllWorks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Stop works';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $allActiveUsers = User::select('id', 'time_offset')->where('status', '1')->get();

        if ($allActiveUsers && count($allActiveUsers) > 0) {
            $allActiveUsersCollection = collect($allActiveUsers);
            $usersWhichDayEnds = $allActiveUsersCollection->filter(function ($user, $key) {
                $now = Carbon::now($user['time_offset'])->subSecond()->toDateTimeString();
                $endDateTime = Carbon::now($user['time_offset'])->subSeconds(10)->endOfDay()->toDateTimeString();
                $isEndDateTheSameAsNow = Carbon::parse($endDateTime)->isSameAs('Y-m-d H:i:s', Carbon::parse($now));
                $isEndDateTimePast = Carbon::parse($endDateTime, $user['time_offset'])->isPast();

                return $isEndDateTheSameAsNow || $isEndDateTimePast;
            });

            if ($usersWhichDayEnds && count($usersWhichDayEnds) > 0) {
                $userIds = $usersWhichDayEnds->map(function ($user, $key) {
                    return $user['id'];
                });

                $toStopWorks = WorkTime::getWorkTimesByUserIds($userIds, 'end_date_time');

                if ($toStopWorks && count($toStopWorks) > 0) {
                    foreach ($toStopWorks as $toStopWork) {
                        foreach ($usersWhichDayEnds as $user) {
                            if ($user['id'] === $toStopWork->user_id) {
                                $userTimeOffset = $user['time_offset'];
                                $startDate = Carbon::parse($toStopWork->start_date_time, $userTimeOffset);
                                $toStopWork->end_date_time = $startDate->endOfDay()->timezone(env('TIMEZONE'))->toDateTimeString();
                                $toStopWork->duration = $startDate->diffInSeconds(Carbon::parse($toStopWork->end_date_time, $userTimeOffset));
                                $toStopWork->save();
                                if(!$toStopWork->wasChanged()){
                                    Log::warning('Stop works: Something went wrong. Following work is not stopped - ' . json_encode($toStopWork));
                                }
                            }
                        }
                    }
                    Log::info('Stop works: Works success stopped');
                }
                Log::info('Stop works: No works for stopping');

                $toSetDurationWorks = WorkTime::getWorkTimesByUserIds($userIds, 'duration');

                if ($toSetDurationWorks && count($toSetDurationWorks) > 0) {
                    foreach ($toSetDurationWorks as $toSetDurationWork) {
                        foreach ($usersWhichDayEnds as $user) {
                            if ($user['id'] === $toSetDurationWork->user_id) {
                                $userTimeOffset = $user['time_offset'];
                                $toSetDurationWork->duration = Carbon::parse($toSetDurationWork->end_date_time, $userTimeOffset)
                                    ->diffInSeconds(Carbon::parse($toSetDurationWork->start_date_time, $userTimeOffset));
                                $toSetDurationWork->save();
                                if(!$toSetDurationWork->wasChanged('duration')){
                                    Log::warning('Stop works: Something went wrong. Following work duration is not set - ' . json_encode($toSetDurationWork));
                                }
                            }
                        }
                    }
                    Log::info('Stop works: Works duration success set');
                }

                $userTimeOffset = "+00:00";
                foreach ($usersWhichDayEnds as $user) {
                    $userTimeOffset = $user['time_offset'];
                    break;
                }
                $beforeYesterdayEndOfDayUtc = Carbon::now($userTimeOffset)->addSeconds(10)->subDays(1)->endOfDay()->utc()->toDateTimeString();
                $toSetSubmittedWorks = WorkTime::getWorkTimesByUserIds($userIds, 'submitted', $beforeYesterdayEndOfDayUtc);

                if ($toSetSubmittedWorks && count($toSetSubmittedWorks) > 0) {
                    foreach ($toSetSubmittedWorks as $toSetSubmittedWork) {
                        $toSetSubmittedWork->submitted = 1;
                        $toSetSubmittedWork->save();

                        if (!$toSetSubmittedWork->wasChanged('submitted')) {
                            Log::warning('Stop works: Something went wrong. Following work submitted is not set - ' . json_encode($toSetSubmittedWork));
                        }
                    }
                    Log::info('Stop works: Works duration success set');
                }
            }
        }
        Log::info('Stop works: No works duration for sting');
        return $this->info('StopAllWorks success ended his job');
    }
}
