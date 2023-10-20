<?php

namespace App\Services;

use App\Http\Requests\UserRoleListRequest;
use App\Repositories\BaseRepository;
use App\Services\Interfaces\BaseServiceInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class BaseService implements BaseServiceInterface
{
    /**
     * @var $modelRepository
     */
    protected $modelRepository;

    /**
     * BaseService constructor.
     *
     * @param BaseRepository $modelRepository
     */
    public function __construct(BaseRepository $modelRepository)
    {
        $this->modelRepository = $modelRepository ;
    }

    /**
     * @return Model
     */
    public function getModel(): ?Model
    {
        return $this->modelRepository->getModel();
    }

    /**
     * @return Collection
     */
    public function all(): Collection
    {
        return $this->modelRepository->all();
    }

    /**
     * @param Request $request
     * @return Model
     */
    public function create(Request $request): Model
    {
        $attributes = $request->all();

        return $this->modelRepository->create($attributes);
    }

    /**
     * @param array $attributes
     * @return Model
     */
    public function add(array $attributes): Model
    {
        return $this->modelRepository->create($attributes);
    }

    /**
     * @param array $attributes
     * @return bool
     */
    public function insert(array $attributes): bool
    {
        return $this->modelRepository->insert($attributes);
    }

    /**
     * @param int $id
     * @return Model|null
     */
    public function find(int $id): ?Model
    {
        return $this->modelRepository->find($id);
    }

    /**
     * @param Request $request
     * @param int $id
     * @return bool
     */
    public function update(Request $request, int $id): bool
    {
        $attributes = $request->all();

        return $this->modelRepository->update($attributes, $id);
    }

    /**
     * @param array $attributes
     * @param int $id
     * @return bool
     */
    public function edit(array $attributes, int $id): bool
    {
        return $this->modelRepository->update($attributes, $id);
    }

    /**
     * @param int $id
     * @return bool|null
     * @throws \Exception
     */
    public function delete(int $id): ?bool
    {
        return $this->modelRepository->delete($id);
    }

    /**
     * @param UserRoleListRequest $request
     * @param $rolesQuery
     * @return array|LengthAwarePaginator
     */
    public function getRolesDataByQuery(UserRoleListRequest $request, $rolesQuery)
    {
        $roles = [];
        if (!empty($request->name)) {
            $rolesQuery->where('name', 'LIKE', '%' . $request->name . '%');
        }

        // filter by created_at
        if (!empty($request->created_at)) {
            $createdAtArr = $request->created_at;
            $fromCreatedAtDate = !empty($createdAtArr[0]) ? $createdAtArr[0] . '00:00:00' : null;
            $toCreatedAtDate = !empty($createdAtArr[1]) ? $createdAtArr[1] . '23:59:59' : null;

            if ($fromCreatedAtDate && $toCreatedAtDate) {
                $rolesQuery->where('created_at', '>=', Carbon::parse($fromCreatedAtDate));
                $rolesQuery->where('created_at', '<=', Carbon::parse($toCreatedAtDate));
            } else if ($fromCreatedAtDate === null && $toCreatedAtDate) {
                $rolesQuery->where('created_at', '<=', Carbon::parse($toCreatedAtDate));
            } else if ($fromCreatedAtDate && $toCreatedAtDate === null) {
                $rolesQuery->where('created_at', '>=', Carbon::parse($fromCreatedAtDate));
            }
        }

        // sorting
        if (!empty($request->sortBy) && !empty($request->order)) {
            $rolesQuery->orderBy($request->sortBy, $request->order);
        }

        if ($rolesQuery !== null) {
            $pageSize = isset($request->pageSize) ? $request->pageSize : config('app.default_per_page');
            $roles = $rolesQuery->paginate($pageSize);
        }
        return $roles;
    }

    /**
     * @param Builder $query
     * @param int $pageSize
     * @return LengthAwarePaginator
     */
    public function orderByNameAndPaginate(Builder $query, int $pageSize): LengthAwarePaginator
    {
        return $this->modelRepository->orderBy($query,'name')->paginate($pageSize);
    }

    /**
     * @param Builder $query
     * @param int $pageSize
     * @return LengthAwarePaginator
     */
    public function orderByCreatedAtAndPaginate(Builder $query, int $pageSize): LengthAwarePaginator
    {
        return $this->modelRepository->orderBy($query,'created_at', 'DESC')->paginate($pageSize);
    }
}
