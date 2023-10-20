<?php

namespace App\Services;

use App\Repositories\ProjectRepository;
use App\Services\Interfaces\ProjectServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class ProjectService extends BaseService implements ProjectServiceInterface
{
    /**
     * ProjectService constructor.
     *
     * @param ProjectRepository $teamRepository
     */
    public function __construct(ProjectRepository $teamRepository)
    {
        parent::__construct($teamRepository);
    }

    /**
     * @return Collection
     */
    public function activeProjects(): Collection
    {
        return $this->modelRepository->activeProjects();
    }

    /**
     * @return array
     */
    public function getAllProjectIds(): array
    {
        return $this->modelRepository->getAllProjectIds();
    }

    /**
     * @param Builder $query
     * @return Collection
     */
    public function getProjectsItems(Builder $query): Collection
    {
        return $this->modelRepository->orderBy($query,'name')->get();
    }

    /**
     * get project ids by user id.
     * @param int $userId
     * @return array
     */
    public function getProjectIdsByUserId(int $userId): array
    {
        return $this->modelRepository->getProjectIdsByUserId($userId);
    }

    /**
     * Get filtered query.
     * @param $request
     * @param $loggedUser
     * @return Builder
     */
    public function getFilteredQuery($request, $loggedUser, $projectIds = []): Builder
    {
        $query = $this->modelRepository->getQuery();
        //logged user see only their assigned projects if not Administrator
        if (!empty($projectIds)) {
            $this->modelRepository->addConditionToQuery('id', $projectIds, $query, 'in');
        }

        // filter by user name
        if (!empty($request->name)) {
            $this->modelRepository->addConditionToQuery('name', $request->name, $query, 'like');
        }

        // filter by status
        if (isset($request->status)) {
            $this->modelRepository->addConditionToQuery('status', [$request->status], $query, 'in');
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
     * Get model.
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->modelRepository->getModel();
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
     * Get statuses.
     * @param array $data
     * @return Model
     */
    public function createProject(array $data): Model
    {
        return $this->modelRepository->create($data);
    }

    /**
     * @param $request
     * @param int $id
     * @return bool
     */
    public function updateProject($request, int $id): bool
    {
        $fillData = [
            "name" => $request['name'],
            "description" => $request['description'] ?? null,
            "status" => $request['status'],
            "type" => $request['type'],
            "price" => $request['price'] ?? null,
            "price_currency" => $request['price_currency'] ?? config('app.default_currency'),
            "deadline" => $request['deadline'],
        ];
        if(!empty($request->color)) {
            $fillData['color'] = $request->color;
        }

        return $this->modelRepository->update($fillData, $id);
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
     * @param int $projectId
     * @return mixed
     */
    public function getMembers(int $projectId)
    {
        return $this->modelRepository->getMembers($projectId);
    }

    /**
     * @param array $projectIds
     * @return mixed
     */
    public function getUserAttachedProjectsQuery(array $projectIds)
    {
        return $this->modelRepository->getUserAttachedProjectsQuery($projectIds);
    }

    /**
     * @return  mixed
     */
    public function getAllProjectsQuery()
    {
        return $this->modelRepository->getAllProjectsQuery();
    }
}
