<?php

namespace App\Services;

use App\Models\UserBonus;
use App\Models\UserJobType;
use App\Models\UserLevel;
use App\Models\UserSalary;
use Illuminate\Support\Arr;
use App\Http\Requests\UsersListRequest;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Services\Interfaces\UserServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Google_Client;
use Google_Service_Calendar;

class UserService extends BaseService implements UserServiceInterface
{
    /**
     * UserService constructor.
     *
     * @param UserRepository $userRepository
     */
    public function __construct(UserRepository $userRepository)
    {
        parent::__construct($userRepository);
    }

    /**
     * @param string $email
     * @return Model
     */
    public function findByEmail(string $email): Model
    {
        return $this->modelRepository->findByEmail($email);
    }

    /**
     * @param int $id
     * @return Model
     */
    public function findByIdWithRolesAndPermissions(int $id): Model
    {
        return $this->modelRepository->findByIdWithRolesAndPermissions($id);
    }

    /**
     * @param UsersListRequest $request
     * @param array $roleIds
     * @return array|LengthAwarePaginator
     */
    public function list(UsersListRequest $request, array $roleIds = [],$showAllRoles = true): LengthAwarePaginator
    {
        $pageSize = $request->pageSize ?? config('app.default_per_page');

        $users = [];
        $memberIds = [];
        $loggedUser = $request->user();
        $usersQuery = $this->modelRepository->queryWithRolesPermissionsContacts();
        if (!$showAllRoles) {
            if ($loggedUser->hasLowestPriorityRole()) { // for staff
                $memberIds = $loggedUser->getTeamMemberIds();
                if (empty($memberIds)) {
                    array_push($memberIds, $loggedUser->id);
                }
            } else {
                $priorityHigherRoles = $loggedUser->priorityHigherRoles();
                $usersQuery->notRole($priorityHigherRoles);
            }
        }

        // filter by user q
        if (isset($request->q)) {
            $q = $this->_escapeLike(trim($request->q));
            $usersQuery->where(function ($query) use ($q) {
                $query->where('users.name', 'LIKE', '%' . $q . '%');
                $query->orWhere('users.surname', 'LIKE', '%' . $q . '%');
                $query->orWhereRaw('CONCAT_WS(" ", trim(users.name), trim(users.surname)) LIKE "%' . $q . '%"'); // filter by full q (name and surname)
                $query->orWhereRaw('CONCAT_WS(" ", trim(users.surname), trim(users.name)) LIKE "%' . $q . '%"'); // filter by full q (surname and name)
                $query->orWhere('users.email', 'LIKE', '%' . $q . '%');
            });
        }


        // filter by user name
        if (isset($request->name)) {
            $name = $this->_escapeLike(trim($request->name));
            $usersQuery->where(function ($query) use ($name) {
                $query->where('users.name', 'LIKE', '%' . $name . '%');
                $query->orWhere('users.surname', 'LIKE', '%' . $name . '%');
                $query->orWhereRaw('CONCAT_WS(" ", trim(users.name), trim(users.surname)) LIKE "%' . $name . '%"'); // filter by full name (name and surname)
                $query->orWhereRaw('CONCAT_WS(" ", trim(users.surname), trim(users.name)) LIKE "%' . $name . '%"'); // filter by full name (surname and name)
                $query->orWhere('users.email', 'LIKE', '%' . $name . '%');
            });
        }

        // filter by user email
        if (!empty($request->email)) {
            $usersQuery->where('users.email', 'LIKE', '%' . $request->email . '%');
        }

        // filter by roles
        if (!empty($roleIds)) {
            $userIdsQuery = \DB::table(config('permission.table_names.model_has_roles'))
                ->whereIn('role_id', $roleIds)
                ->where('model_type', '=', User::class);

            if (!empty($memberIds)) {
                $userIdsQuery->whereIn('model_id', $memberIds);
            }

            $userIds = $userIdsQuery->pluck('model_id')->toArray();
            if (!empty($userIds)) {
                $userIds = array_unique($userIds);
                $usersQuery->whereIn('users.id', $userIds);
            } else {
                $usersQuery->where('users.id', 0); // no any user with selected $roleIds
            }
        } else if (!empty($memberIds)) {
            $usersQuery->whereIn('users.id', $memberIds);
        }

        // filter by statuses
        if (isset($request->status)) {
            $usersQuery->where('users.status', $request->status);
        }

        // filter by created_at
        if (!empty($request->created_at)) {
            $createdAtArr = $request->created_at;
            $fromCreatedAtDate = !empty($createdAtArr[0]) ? $createdAtArr[0] . '00:00:00' : null;
            $toCreatedAtDate = !empty($createdAtArr[1]) ? $createdAtArr[1] . '23:59:59' : null;

            if ($fromCreatedAtDate && $toCreatedAtDate) {
                $usersQuery->where('users.created_at', '>=', Carbon::parse($fromCreatedAtDate));
                $usersQuery->where('users.created_at', '<=', Carbon::parse($toCreatedAtDate));
            } else if ($fromCreatedAtDate === null && $toCreatedAtDate) {
                $usersQuery->where('users.created_at', '<=', Carbon::parse($toCreatedAtDate));
            } else if ($fromCreatedAtDate && $toCreatedAtDate === null) {
                $usersQuery->where('users.created_at', '>=', Carbon::parse($fromCreatedAtDate));
            }
        }

        // sorting
        if (!empty($request->sortBy) && !empty($request->order)) {
            $request->sortBy === 'user_role'
                ? $usersQuery->roleName()->orderBy('role_name', $request->order)
                : $usersQuery->orderBy($request->sortBy, $request->order);
        }

        if ($usersQuery !== null) {
            $users = $usersQuery->paginate($pageSize);
        }

        return $users;
    }

    /**
     * @return Collection
     */
    public function activeUsersWithTeams(): Collection
    {
        return $this->modelRepository->activeUsersWithTeams();
    }

    /**
     * @param array $fields
     * @return Collection
     */
    public function getUsers(array $fields): Collection
    {
        return $this->modelRepository->getUsers($fields);
    }

    /**
     * @param array $fields
     * @return Collection
     */
    public function getActiveUsers(array $fields): Collection
    {
        return $this->modelRepository->activeUsers($fields);
    }

    /**
     * get user education information
     * @param int $userId
     * @return Model
     */
    public function getUserEducationInfoData(int $userId): Model
    {
        return $this->modelRepository->getUserEducationInfoData($userId);
    }

    /**
     * @param array $userIds
     * @param string $userStatus
     * @return array
     */
    public function getUserIdsByIdsAndStatus(array $userIds, string $userStatus): array
    {
        return $this->modelRepository->getUserIdsByIdsAndStatus($userIds, $userStatus);
    }

    /**
     * @param string $userStatus
     * @return array
     */
    public function getUserIdsByStatus(string $userStatus): array
    {
        return $this->modelRepository->getUserIdsByStatus($userStatus);
    }

    /**
     * @param int $userId
     * @param array $select
     * @return Model
     */
    public function selectUserById(int $userId, array $select): ?Model
    {
        return $this->modelRepository->selectUserById($userId, $select);
    }

    /**
     * @return array
     */
    public function getAllUserIds(): array
    {
        return $this->modelRepository->getAllUserIds();
    }

    /**
     * @param string $userEmail
     * @return object
     */
    public function getUserByEmail(string $userEmail)
    {
        return User::whereEmail($userEmail)->first();
    }

    /**
     * @param string $email
     * @param string $password
     */
    public function updateUserPassword(string $email, string $password)
    {
        return $this->modelRepository->updateUserPassword($email, $password);
    }


    /**
     * @param string $email
     * @return bool
     */
    public function checkActiveUserByEmail(string $email): bool
    {
        return $this->modelRepository->checkActiveUserByEmail($email);
    }

    /**
     * @param int $userId
     * @return string
     */
    public function getStorageGoogleTokenPath(int $userId): string
    {
        return str_replace(':userId:', $userId, config('app.storage_google_calendar_folder')) . '/token.json';
    }

    /**
     * @param int $userId
     * @return string|null
     * @throws \Exception
     */
    public function getGoogleAuthUrl(int $userId): ?string
    {
        $client = $this->getGoogleClientWithUncheckedAccessToken($userId);
        // If there is no previous token or it's expired.
        if ($client->isAccessTokenExpired()) {
            if (!$client->getRefreshToken()) {
                return $client->createAuthUrl();
            }
        }
        return null;
    }

    /**
     * @param int $userId
     * @return Google_Client
     * @throws \Google\Exception
     */
    public function getGoogleClientWithUncheckedAccessToken(int $userId): Google_Client
    {
        $client = new Google_Client();
        $client->setApplicationName('Google Calendar API PHP Quickstart');
        $client->setScopes(Google_Service_Calendar::CALENDAR);
        $client->setAuthConfig(base_path('google_credentials.json'));
        $client->setAccessType('offline');
        $client->setApprovalPrompt('force');
        // Using "consent" ensures that your application always receives a refresh token.
        // If you are not using offline access, you can omit this.
        $client->setPrompt('consent');
        $client->setIncludeGrantedScopes(true);   // incremental auth
        $redirectUrl = config('app.app_frontend_url') . '/' . app()->getLocale() . '/dashboard';
        $client->setRedirectUri($redirectUrl);

        // Load previously authorized token from a file, if it exists.
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        $tokenPath = $this->getStorageGoogleTokenPath($userId);
        if (Storage::exists($tokenPath)) {
            $accessToken = json_decode(file_get_contents(storage_path('app/' . $tokenPath)), true);
            $client->setAccessToken($accessToken);
        }
        return $client;
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @param bool $isProject
     * @return mixed
     */
    public function getFullCalendarData(int $userId, string $start, string $end, string $utcOffset = '+00:00', bool $isProject = false)
    {
        $timezone = Carbon::now($utcOffset)->getTimezone();
        $items = $this->modelRepository->getFullCalendarData($userId, $start, $end, $utcOffset);
        $workTimeIds = $items->pluck('work_time_id')->toArray();
        $tagList = $this->modelRepository->getTagListByUserIdWorkTimeIds($userId, $workTimeIds);
        return $items
            ->map(function ($item) use ($timezone, $isProject, $tagList) {
                $startDateTime = Carbon::parse($item->start_date_time)->timezone($timezone)->format('Y-m-d H:i:s');
                $endDateTime = !empty($item->end_date_time)
                    ? Carbon::parse($item->end_date_time)->timezone($timezone)->format('Y-m-d H:i:s')
                    : Carbon::now()->timezone($timezone)->format('Y-m-d H:i:s');
                $projectName = !empty($item->project_name) ? $item->project_name : __('No Project');
                $backgroundColor = !$isProject ? config('app.calendar_tasks_color') : config('app.calendar_projects_color');
                $tags = collect([]);
                foreach ($tagList as $tag) {
                    if ($tag->work_time_id !== $item->work_time_id) continue;
                    $tags->add($tag);
                }
                return [
                    'event_type' => 'tasks',
                    'work_id' => !empty($item->work_id) ? $item->work_id : null,
                    'project_id' => !empty($item->project_id) ? $item->project_id : null,
                    'project_name' => $projectName,
                    'project_color' => !empty($item->project_color) ? $item->project_color : config('app.calendar_projects_color'),
                    'work_duration' => gmdate("H:i", $item->duration),
                    'work_name' => $item->work_name,
                    'work_time_id' => $item->work_time_id,
                    'work_user_id' => $item->work_user_id,
                    'description' => $item->task_description,
                    'title' => !$isProject ? $item->work_name : $projectName,
                    'start' => $startDateTime,
                    'end' => $endDateTime,
                    'textColor' => '#ffffff', // default white
                    'backgroundColor' => $backgroundColor,
                    'allDay' => false,
                    'isRunning' => empty($item->end_date_time),
                    'tags' => $tags,
                ];
            });
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return mixed
     */
    public function getFullCalendarTags(int $userId, string $start, string $end, string $utcOffset = '+00:00')
    {
        $timezone = Carbon::now($utcOffset)->getTimezone();
        $items = $this->modelRepository->getFullCalendarTags($userId, $start, $end, $utcOffset);

        $events = collect([]);
        $tags = [];
        foreach ($items as $item) {
            if (!isset($tags[$item->work_time_id])) {
                $events->add($item);
            }
            $tags[$item->work_time_id][] = [
                'id' => $item->tag_id,
                'name' => $item->tag_name,
                'color' => $item->tag_color,
                'work_id' => $item->work_id,
                'work_time_id' => $item->work_time_id,
            ];
        }

        return $events->map(function ($item) use ($timezone, $tags) {
                $startDateTime = Carbon::parse($item->start_date_time)->timezone($timezone)->format('Y-m-d H:i:s');
                $endDateTime = !empty($item->end_date_time)
                    ? Carbon::parse($item->end_date_time)->timezone($timezone)->format('Y-m-d H:i:s')
                    : Carbon::now()->timezone($timezone)->format('Y-m-d H:i:s');
                return [
                    'event_type' => 'tags',
                    'work_id' => !empty($item->work_id) ? $item->work_id : null,
                    'project_id' => !empty($item->project_id) ? $item->project_id : null,
                    'project_name' => !empty($item->project_name) ? $item->project_name : __('No Project'),
                    'work_duration' => gmdate("H:i", $item->duration),
                    'work_name' => $item->work_name,
                    'work_time_id' => $item->work_time_id,
                    'work_user_id' => $item->work_user_id,
                    'description' => $item->task_description,
                    'title' => join(', ', Arr::pluck($tags[$item->work_time_id], 'name')),
                    'start' => $startDateTime,
                    'end' => $endDateTime,
                    'textColor' => '#ffffff', // default white
                    'backgroundColor' => config('app.calendar_tags_color'),
                    'allDay' => false,
                    'isRunning' => empty($item->end_date_time),
                    'tags' => $tags[$item->work_time_id],
                ];
            });
    }

    /**
     * @param int $userId
     * @return Google_Client|null
     * @throws \Google\Exception
     */
    public function getGoogleClientWithCheckedAccessToken(int $userId): ?Google_Client
    {
        $client = $this->getGoogleClientWithUncheckedAccessToken($userId);
        if ($client->isAccessTokenExpired()) {
            // Refresh the token if possible, else fetch a new one.
            if ($client->getRefreshToken()) {
                $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
                $accessData = $client->getAccessToken();
                // Save the token to a file.
                $storageGoogleTokenPath = $this->getStorageGoogleTokenPath($userId);
                if (!isset($accessData['refresh_token']) && Storage::exists($storageGoogleTokenPath)) {
                    $oldAccessToken = json_decode(file_get_contents(storage_path('app/' . $storageGoogleTokenPath)), true);
                    if (isset($oldAccessToken['refresh_token'])) {
                        $accessData['refresh_token'] = $oldAccessToken['refresh_token'];
                    }
                }

                Storage::disk('local')->put($storageGoogleTokenPath, json_encode($accessData));
            } else {
                return null;
            }
        }
        return $client;
    }

    /**
     * @param int $userId
     * @param string $start
     * @param string $end
     * @param string $utcOffset
     * @return array
     */
    public function getFullCalendarGoogleEvents(int $userId, string $start, string $end, string $utcOffset = '+00:00'): array
    {
        $googleEvents = [];
        try {
            $timezone = Carbon::now($utcOffset)->getTimezone();
            $client = $this->getGoogleClientWithCheckedAccessToken($userId);
            if (!$client) return []; // Cannot get client
            $storageGoogleTokenPath = $this->getStorageGoogleTokenPath($userId);
            if (!Storage::exists($storageGoogleTokenPath)) return []; // The Google Calendar did not connected yet

            $service = new Google_Service_Calendar($client);
            // Print the next 300 events on the user's calendar.
            $calendarId = 'primary';
            $optParams = array(
                'maxResults' => 300,
                'orderBy' => 'startTime',
                'singleEvents' => true,
                'timeMin' => Carbon::parse($start)->timezone($timezone)->format('c'),
                'timeMax' => Carbon::parse($end)->timezone($timezone)->format('c'),
            );
            $results = $service->events->listEvents($calendarId, $optParams);
            $events = $results->getItems();
            if (!empty($events)) {
                foreach ($events as $event) {
                    $title = $event->getSummary();
                    // todo maybe here we need to check $event->start->timeZone and $event->end->timeZone
                    $start = !empty($event->start->dateTime) ? $event->start->dateTime : $event->start->date;
                    $end = !empty($event->end->dateTime) ? $event->end->dateTime : $event->start->date; // here need to add $event->start->date for allDay=true

                    $_startDateTime = Carbon::parse($start)->timezone($timezone);
                    $_endDateTime = Carbon::parse($end)->timezone($timezone);

                    $duration = $_endDateTime->diffInSeconds($_startDateTime);

                    $startDateTime = $_startDateTime->format('Y-m-d H:i:s');
                    $endDateTime = $_endDateTime->format('Y-m-d H:i:s');
                    $meetLink = !empty($event->getHangoutLink()) ?  '<a href="'.$event->getHangoutLink().'" target="_blank">'.$event->getHangoutLink().'</a>' : '';

                    $googleEvents[] = [
                        'event_type' => 'google',
                        'work_id' => $event->getId(),
                        'project_id' => null,
                        'project_name' => __('Google Event'),
                        'work_duration' =>  empty($duration) ? 0 : gmdate("H:i", $duration),
                        'work_name' => $title,
                        'work_user_id' => $userId,
                        'work_time_id' => null,
                        'description' => $event->getDescription() . $meetLink ,
                        'title' => $title,
                        'start' => $startDateTime,
                        'end' => $endDateTime,
                        'textColor' => '#ffffff', // default white
                        'backgroundColor' => config('app.calendar_google_color'),
                        'allDay' => empty($event->end->dateTime),
                        'isRunning' => false,
                        'tags' => [],
                    ];
                }
            }
        } catch (\Exception $exception) {
            \Log::error($exception->getMessage());
        }

        return $googleEvents;
    }

    /**
     * @param $data
     * @return \Google_Service_Calendar_Event|null
     */
    public function updateGoogleEvent($data): ?\Google_Service_Calendar_Event
    {
        $updatedEvent = null;
        try {
            $calendarId = 'primary';
            $client = $this->getGoogleClientWithCheckedAccessToken($data['user_id']);
            if (!$client) return null; // Cannot get client
            $service = new Google_Service_Calendar($client);
            // Get Event for edit
            $event = $service->events->get($calendarId, $data['google_event_id']);
            $startEnd = $this->getGoogleStartEndTimes( $data['start_date_time'], $data['all_day'],  $data['end_date_time'], $data['time_offset']);
            $event->setDescription($data['description']);
            $event = $this->setStartEndTimesForGoogleEvent($event, $startEnd['start'], $startEnd['end'], $data['all_day']);
            $updatedEvent = $service->events->update('primary',  $data['item'], $event);
        } catch (\Exception $exception) {
            \Log::error($exception->getMessage());
        }
        return $updatedEvent;
    }

    /**
     * @param $data
     * @return \Google_Service_Calendar_Event|null
     */
    public function deleteGoogleEvent($data)
    {
        try {
            $calendarId = 'primary';
            $client = $this->getGoogleClientWithCheckedAccessToken($data['id']);

            if (!$client)
                return [
                    "status" => false,
                    "message" => "Cannot get client!"
                ]; // Cannot get client

            $service = new Google_Service_Calendar($client);
            $service->events->delete($calendarId, $data['google_event_id']);
        } catch (\Exception $exception) {
            \Log::error($exception->getMessage());
        }
        return [
            "status" => true,
            "message" => "Note deleted successfully!"
        ];
    }

    /**
     * @param $data
     * @return \Google_Service_Calendar_Event|null
     */
    public function addGoogleEvent($data): ?\Google_Service_Calendar_Event
    {
        $addedEvent = null;
        try {
            $calendarId = 'primary';
            $client = $this->getGoogleClientWithCheckedAccessToken($data['user_id']);
            if (!$client) return null; // Cannot get client
            $service = new Google_Service_Calendar($client);
            // Get Event for edit
            $event = new \Google_Service_Calendar_Event();
            $startEnd = $this->getGoogleStartEndTimes($data['start_date_time'], $data['all_day'], $data['end_date_time'], $data['time_offset']);
            $event->setSummary($data['item']);
            $data['description'] && $event->setDescription($data['description']);
            $event = $this->setStartEndTimesForGoogleEvent($event, $startEnd['start'], $startEnd['end'], $data['all_day']);
            $addedEvent = $service->events->insert($calendarId, $event);
        } catch (\Exception $exception) {
            \Log::error($exception->getMessage());
        }
        return $addedEvent;
    }
    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserForCalendarView(int $userId)
    {
        return $this->modelRepository->getUserForCalendarView($userId);
    }

    /**
     * @param object $data
     * @return object
     */
    public function userRegistration(object $data): object
    {
        return $this->modelRepository->userRegistration($data);
    }

    /**
     * @param string $start
     * @param bool $allDay
     * @param string|null $end
     * @param string $utcOffset
     * @return array
     */
    private function getGoogleStartEndTimes(string $start, bool $allDay, string $end = null, $utcOffset = '+00:00'): array
    {
        if ($allDay) {
            $start =  Carbon::parse($start, $utcOffset);
            $_end = $_start = $start->format(config('app.full_date_format')); // important
        } else {
            $start = Carbon::parse($start, $utcOffset)->setTimezone('UTC');
            $_start = $start->format(config('app.full_date_time_format'));
            $end = !$end ? $start->addMinute(30) : Carbon::parse($end, $utcOffset)->setTimezone('UTC');
            $_end = $end->format(config('app.full_date_time_format'));
        }

        return ['start' => $_start, 'end' => $_end];
    }

    /**
     * @param \Google_Service_Calendar_Event $event
     * @param string $start
     * @param string $end
     * @param bool $allDay
     * @return \Google_Service_Calendar_Event
     * @throws \Exception
     */
    private function setStartEndTimesForGoogleEvent(\Google_Service_Calendar_Event $event, string $start, string $end, bool $allDay): \Google_Service_Calendar_Event
    {
        $startDateTime = new \DateTime($start);
        $googleStartDateTime = new \Google_Service_Calendar_EventDateTime();
        $allDay
            ? $googleStartDateTime->setDate($startDateTime->format(config('app.full_date_format')))
            : $googleStartDateTime->setDateTime($startDateTime->format(\DateTime::RFC3339));
        $event->setStart($googleStartDateTime);

        // end part
        $endDateTime = new \DateTime($end);
        $googleEndDateTime = new \Google_Service_Calendar_EventDateTime();
        $allDay
            ? $googleEndDateTime->setDate($endDateTime->format(config('app.full_date_format')))
            : $googleEndDateTime->setDateTime($endDateTime->format(\DateTime::RFC3339));
        $event->setEnd($googleEndDateTime);

        return $event;
    }

    /**
     * @param int $userId
     */
    public function getUserById(int $userId)
    {
        return $this->modelRepository->getUserById($userId);
    }

    /**
     * @param int $userId
     * @return bool
     */
    public function deleteUser(int $userId): bool
    {
        return $this->modelRepository->deleteUser($userId);
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserCasualInformation(int $userId)
    {
        return $this->modelRepository->getUserCasualInformation($userId);
    }

    /**
     * @param object $request
     * @return bool
     */
    public function createUserCasualInformation(object $request): bool
    {
        return $this->modelRepository->createUserCasualInformation($request);
    }

    /**
     * @param object $request
     * @return bool
     */
    public function updateUserCasualInformation(object $request): bool
    {
        return $this->modelRepository->updateUserCasualInformation($request);
    }

    /**
     * @param int $userId
     * @param int $casualId
     * @return bool
     */
    public function deleteUserCasualInformation(int $userId, int $casualId): bool
    {
        return $this->modelRepository->deleteUserCasualInformation($userId, $casualId);
    }

    /**
     * @param object $request
     * @param int $id
     * @param string $eventId
     * @return mixed
     */
    public function updateOrCreateNotesInformation(object $request, int $id, string $eventId = null)
    {
        return $this->modelRepository->updateOrCreateNotesInformation($request, $id, $eventId);
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getNoteForActiveUsers(int $userId): array
    {
        return $this->modelRepository->getNoteForActiveUsers($userId);
    }

    /**
     * @param int $userId
     * @param array $spouseData
     * @return mixed
     */
    public function createOrUpdateSpouseData(int $userId, array $spouseData)
    {
        return $this->modelRepository->createOrUpdateSpouseData($userId, $spouseData);
    }

    /**
     * @param int $userId
     * @param int $status
     * @return bool
     */
    public function changeUserStatus(int $userId, int $status): bool
    {
        return $this->modelRepository->changeUserStatus($userId, $status);
    }

    /**
     * @param array $userIds
     * @return mixed
     */
    public function getUserPositionsByUserIds(array $userIds)
    {
        return $this->modelRepository->getUserPositionsByUserIds($userIds);
    }

    /**
     * @return mixed
     */
    public function getUserJobTypes()
    {
        return UserJobType::get(['id', 'name']);
    }

    /**
     * @return mixed
     */
    public function getUserLevels()
    {
        return UserLevel::get(['id', 'name']);
    }

    /**
     * @param int $salaryId
     * @param int $userId
     * @return mixed
     */
    public function getUserSalaryById(int $salaryId, int $userId)
    {
        return UserSalary::where('id', $salaryId)->where('user_id', $userId)->first();
    }

    /**
     * @param UserSalary $salary
     * @param array $data
     * @return UserSalary
     */
    public function updateUserSalary(UserSalary $salary, array $data): UserSalary
    {
        $needToUpdate = false;
        if ($salary->user_id != $data['user_id']) {
            $salary->user_id = $data['user_id'];
            $needToUpdate = true;
        }
        if ($salary->user_level_id != $data['user_level_id']) {
            $salary->user_level_id = $data['user_level_id'];
            $needToUpdate = true;
        }
        if ($salary->salary != $data['salary']) {
            $salary->salary = $data['salary'];
            $needToUpdate = true;
        }
        if ($salary->salary_currency != $data['salary_currency']) {
            $salary->salary_currency = $data['salary_currency'];
            $needToUpdate = true;
        }
        if ($salary->start_date != $data['start_date']) {
            $salary->start_date = $data['start_date'];
            $needToUpdate = true;
        }
        if ($salary->end_date != $data['end_date']) {
            $salary->end_date = $data['end_date'];
            $needToUpdate = true;
        }
        if ($salary->true_cost != $data['true_cost']) {
            $salary->true_cost = $data['true_cost'];
            $needToUpdate = true;
        }
        if ($salary->true_cost_currency != $data['true_cost_currency']) {
            $salary->true_cost_currency = $data['true_cost_currency'];
            $needToUpdate = true;
        }
        if ($salary->status != $data['status']) {
            $salary->status = $data['status'];
            $needToUpdate = true;
        }
//        $salary->rate = $data['rate'];
        if ($needToUpdate) $salary->save();
        return $salary;
    }

    /**
     * @param array $data
     * @return UserSalary
     */
    public function addUserSalary(array $data): UserSalary
    {
        $salary = new UserSalary();
        $salary->fill([
            'user_id' => $data['user_id'],
            'user_level_id' => $data['user_level_id'],
            'salary' => $data['salary'],
            'salary_currency' => $data['salary_currency'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'true_cost' => $data['true_cost'],
            'true_cost_currency' => $data['true_cost_currency'],
            'status' => $data['status'],
//            'rate' => $data['rate'],
        ]);
        $salary->save();
        return $salary;
    }

    /**
     * @param array $ids
     * @param int $userId
     * @return mixed
     */
    public function removeUserSalaries(array $ids, int $userId)
    {
        return UserSalary::where('user_id', $userId)->whereIn('id', $ids)->delete();
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getUserSalaryIds(int $userId): array
    {
        return UserSalary::where('user_id', $userId)->pluck('id')->toArray();
    }

    /**
     * @param int $bonusId
     * @param int $userId
     * @return mixed
     */
    public function getUserBonusById(int $bonusId, int $userId)
    {
        return UserBonus::where('id', $bonusId)->where('user_id', $userId)->first();
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getUserBonusIds(int $userId): array
    {
        return UserBonus::where('user_id', $userId)->pluck('id')->toArray();
    }

    /**
     * @param array $ids
     * @param int $userId
     * @return mixed
     */
    public function removeUserBonuses(array $ids, int $userId)
    {
        return UserBonus::where('user_id', $userId)->whereIn('id', $ids)->delete();
    }

    /**
     * @param UserBonus $bonus
     * @param array $data
     * @return UserBonus
     */
    public function updateUserBonus(UserBonus $bonus, array $data): UserBonus
    {
        $needToUpdate = false;
        if ($bonus->user_id != $data['user_id']) {
            $bonus->user_id = $data['user_id'];
            $needToUpdate = true;
        }
        if ($bonus->title != $data['title']) {
            $bonus->title = $data['title'];
            $needToUpdate = true;
        }
        if ($bonus->description != $data['description']) {
            $bonus->description = $data['description'];
            $needToUpdate = true;
        }
        if ($bonus->type != $data['type']
            && in_array($data['type'], [UserBonus::TYPE_BONUS, UserBonus::TYPE_OTHER_SPEND])) {
            $bonus->type = $data['type'];
            $needToUpdate = true;
        }
        if ($bonus->bonus != $data['bonus']) {
            $bonus->bonus = $data['bonus'];
            $needToUpdate = true;
        }
        if ($bonus->currency != $data['currency']) {
            $bonus->currency = $data['currency'];
            $needToUpdate = true;
        }
        if ($bonus->date != $data['date']) {
            $bonus->date = $data['date'];
            $needToUpdate = true;
        }

        if ($needToUpdate) $bonus->save();
        return $bonus;
    }

    /**
     * @param array $data
     * @return UserBonus
     */
    public function addUserBonus(array $data): UserBonus
    {
        $bonus = new UserBonus();
        $bonus->fill([
            'user_id' => $data['user_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'type' => $data['type'],
            'bonus' => $data['bonus'],
            'currency' => $data['currency'],
            'date' => $data['date'],
        ]);
        $bonus->save();
        return $bonus;
    }

    /**
     * @param int $userId
     * @return mixed
     */
    public function getUserCountKids(int $userId)
    {
        return $this->modelRepository->getUserCountKids($userId);
    }

    /**
     * @param int $id
     * @return mixed
     */
    public function getNote(int $id)
    {
        return $this->modelRepository->getNote($id);
    }
    /**
     * @param string $uuId
     * @return mixed
     */
    public function removeNote(string $uuId)
    {
        return $this->modelRepository->removeNote($uuId);
    }

    /**
     * @param int $userId
     * @param string $userEmail
     * @return bool
     */
    public function updateUserEmail(int $userId, string $userEmail): bool
    {
        return $this->modelRepository->updateUserEmail($userId, $userEmail);
    }


    private function _escapeLike(string $value): string
    {
        $char = '\\';
        return str_replace(
            [$char, '%', '_','@'],
            [$char.$char, $char.'%', $char.'_', $char.'@'],
            $value
        );
    }

    /**
     * @param int $userId
     * @param string|null $userProfessionalStory
     * @return mixed
     */
    public function updateUserProfessionalStory(int $userId, string $userProfessionalStory = null)
    {
        return $this->modelRepository->updateUserProfessionalStory($userId, $userProfessionalStory);
    }

    /**
     * @param int $salaryId
     * @param int $userId
     * @return bool
     */
    public function deleteUserSalary(int $salaryId, int $userId): bool
    {
        return $this->modelRepository->deleteUserSalary($salaryId, $userId);
    }

    /**
     * @param int $salaryId
     * @param int $userId
     * @param string $type
     * @return bool
     */
    public function deleteUserBonus(int $salaryId, int $userId, string $type): bool
    {
        return $this->modelRepository->deleteUserBonus($salaryId, $userId, $type);
    }

    /**
     * @return object
     */
    public function getQuerySkills(): object
    {
        return $this->modelRepository->getQuerySkills();
    }

    /**
     * @param array $skillData
     * @return mixed
     */
    public function insertAndGetInsertedSkillIds(array $skillData)
    {
        return $this->modelRepository->insertAndGetInsertedSkillIds($skillData);
    }

    /**
     * @param array $skillIds
     * @return array
     */
    public function getCheckedSkillIds(array $skillIds): array
    {
        return $this->modelRepository->getCheckedSkillIds($skillIds);
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getExistingSkillsIds(int $userId): array
    {
        return $this->modelRepository->getExistingSkillsIds($userId);
    }

    /**
     * @param int $userId
     * @param array $skillsToDelete
     * @return bool
     */
    public function deleteUserSkills(int $userId, array $skillsToDelete): bool
    {
        return $this->modelRepository->deleteUserSkills($userId, $skillsToDelete);
    }

    /**
     * @param int $userId
     * @param array $skillIds
     * @return mixed
     */
    public function insertUserSkills(int $userId, array $skillIds)
    {
        return $this->modelRepository->insertUserSkills($userId, $skillIds);
    }

    /**
     * @return object
     */
    public function getQuerySoftSkills(): object
    {
        return $this->modelRepository->getQuerySoftSkills();
    }

    /**
     * @param array $softSkillData
     * @return mixed
     */
    public function insertAndGetInsertedSoftSkillIds(array $softSkillData)
    {
        return $this->modelRepository->insertAndGetInsertedSoftSkillIds($softSkillData);
    }

    /**
     * @param array $softSkillIds
     * @return array
     */
    public function getCheckedSoftSkillIds(array $softSkillIds): array
    {
        return $this->modelRepository->getCheckedSoftSkillIds($softSkillIds);
    }

    /**
     * @param int $userId
     * @return array
     */
    public function getExistingSoftSkillsIds(int $userId): array
    {
        return $this->modelRepository->getExistingSoftSkillsIds($userId);
    }

    /**
     * @param int $userId
     * @param array $softSkillsToDelete
     * @return bool
     */
    public function deleteUserSoftSkills(int $userId, array $softSkillsToDelete): bool
    {
        return $this->modelRepository->deleteUserSoftSkills($userId, $softSkillsToDelete);
    }

    /**
     * @param int $userId
     * @param array $softSkillIds
     * @return mixed
     */
    public function insertUserSoftSkills(int $userId, array $softSkillIds)
    {
        return $this->modelRepository->insertUserSoftSkills($userId, $softSkillIds);
    }
}
