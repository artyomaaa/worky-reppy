<?php

namespace App\Services;

use App\Http\Requests\TeamsListRequest;
use App\Repositories\TeamRepository;
use App\Services\Interfaces\TeamServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class TeamService extends BaseService implements TeamServiceInterface
{
    /**
     * TeamService constructor.
     *
     * @param TeamRepository $teamRepository
     */
    public function __construct(TeamRepository $teamRepository)
    {
        parent::__construct($teamRepository);
    }

    /**
     * @param int $id
     * @return Model|null
     */
    public function teamByIdWithMembersProjects(int $id): ?Model
    {
        return $this->modelRepository->teamByIdWithMembersProjects($id);
    }
    /**
     * @param TeamsListRequest $request
     * @return array|LengthAwarePaginator
     */
    public function list(TeamsListRequest $request, $teamIds = []): LengthAwarePaginator
    {
        $pageSize = $request->pageSize ?? 12;
        $loggedUser = $request->user();
        $itemsQuery = null;
        $items = [];
        $itemsQuery = $this->modelRepository->queryWithMembersProjects($teamIds);
//        $status = $request->status !== null ? $request->status : null;
//        if ($status === null) {
//            $itemsQuery = $this->modelRepository->queryWithMembersProjects();
//        } else {
//            $itemsQuery = $this->modelRepository->queryByStatusWithMembers($status);
//        }

        // filter by user name
        if (!empty($request->name)) {
            $itemsQuery->where('name', 'LIKE' , '%' . $request->name . '%');
        }

        // filter by status
        if (isset($request->status)) {
            $itemsQuery->where('status', $request->status);
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
                $itemsQuery->whereBetween('created_at', [$fromCreatedAtDate, $toCreatedAtDate]);
            } else if ($fromCreatedAtDate === null && $toCreatedAtDate) {
                $itemsQuery->where('created_at', '<=' , $toCreatedAtDate);
            } else if ($fromCreatedAtDate && $toCreatedAtDate === null) {
                $itemsQuery->where('created_at', '>=' , $fromCreatedAtDate);
            }
        }

        if ($itemsQuery !== null) {
            $items = $itemsQuery->paginate($pageSize);
        }

        return $items;
    }

    /**
     * @param array $userIds
     * @param string $startDateTime
     * @param string $endDateTime
     * @return mixed
     */
    public function userWorkDurations(array $userIds, string $startDateTime, string $endDateTime)
    {
        return $this->modelRepository->userWorkDurations($userIds, $startDateTime, $endDateTime);
    }

    /**
     * @param int $userId
     * @param string|null $startDateTime
     * @param string|null $endDateTime
     * @return mixed
     */
    public function teamMemberWorkDuration(int $userId, $startDateTime = null, $endDateTime = null)
    {
        return $this->modelRepository->teamMemberWorkDuration($userId, $startDateTime, $endDateTime);
    }

    /**
     * @param int $id
     * @param bool $status
     * @return mixed
     */
    public function updateTeamStatus(int $id, bool $status)
    {
        return $this->modelRepository->update(['status' => $status], $id);
    }

    /**
     * @param object $request
     * @return mixed
     */
    public function getTeamsForExport(object $request)
    {
        $filter = json_decode($request->fields);
        $loggedUser = $request->user();
        $itemsQuery = null;
        $itemsQuery = $this->modelRepository->queryWithMembers();

        // filter by user name
        if (!empty($filter->name)) {
            $itemsQuery->where('name', 'LIKE' , '%' . $filter->name . '%');
        }
        // filter by statues
        if (!!($filter->status) || $filter->status === '0') {
            $statuses = !is_array($filter->status) ? [$filter->status] : $filter->status;
            $itemsQuery->whereIn('status', $statuses);
        }

        // filter by created_at
        if (!empty($filter->created_at)) {
            $createdAtArr = $filter->created_at;
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
                $itemsQuery->whereBetween('created_at', [$fromCreatedAtDate, $toCreatedAtDate]);
            } else if ($fromCreatedAtDate === null && $toCreatedAtDate) {
                $itemsQuery->where('created_at', '<=' , $toCreatedAtDate);
            } else if ($fromCreatedAtDate && $toCreatedAtDate === null) {
                $itemsQuery->where('created_at', '>=' , $fromCreatedAtDate);
            }
        }

        return $itemsQuery->get(['id','created_at', 'status', 'name']);
    }

    /**
     * @param int $teamId
     * @return mixed
     */
    public function getTeamById(int $teamId)
    {
        return $this->modelRepository->getTeamById($teamId);
    }

}
