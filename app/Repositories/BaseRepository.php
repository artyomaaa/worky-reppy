<?php

namespace App\Repositories;

use App\Repositories\Interfaces\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use \Illuminate\Contracts\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements BaseRepositoryInterface
{
    /**
     * @var Model
     */
    protected $model;

    /**
     * BaseRepository constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->setModel($model);
    }

    /**
     * @param Model $model
     */
    public function setModel(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->model;
    }

    /**
     * Get query.
     * @return Builder
     */
    public function getQuery(): Builder
    {
        return $this->model::query();
    }

    /**
     * @param array $attributes
     *
     * @return Model
     */
    public function create(array $attributes): Model
    {
        return $this->model->create($attributes);
    }

    /**
     * @param array $attributes
     *
     * @return bool
     */
    public function insert(array $attributes): bool
    {
        return $this->model->insert($attributes);
    }

    /**
     * @return Collection
     */
    public function all(): Collection
    {
        return $this->model->all();
    }

    /**
     * @param int $id
     * @return Model|null
     */
    public function find(int $id): ?Model
    {
        return $this->model->find($id);
    }

    /**
     * @param array $attributes
     * @param int $id
     * @return bool
     */
    public function update(array $attributes, int $id): bool
    {
        return $this->model->whereId($id)->update($attributes);
    }

    /**
     * @param int $id
     * @return bool|null
     * @throws \Exception
     */
    public function delete(int $id): ?bool
    {
        return $this->model->destroy($id);
    }

    /**
     * Get paginate.
     * @param Builder $query
     * @param int $pageSize
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function paginate(Builder $query, int $pageSize): ?LengthAwarePaginator
    {
        return $query->paginate($pageSize);
    }

    /**
     * Order By.
     * @param Builder $query
     * @param string $name
     * @param string $direction
     * @return Builder
     */
    public function orderBy(Builder $query, string $name, string $direction = 'ASC'): Builder
    {
        return $query->orderBy($name, $direction);
    }

    /**
     * Add Condition To Query.
     * @param $type
     * @param $field
     * @param $value
     * @param $query
     * @param $condition
     * @return Builder
     */
    public function addConditionToQuery($field, $value, $query, $type = 'normal', $condition = '='): Builder
    {
        switch ($type) {
            case 'normal':
                $query->where($field, $condition, $value);
                break;
            case 'in':
                $query->whereIn($field, $value);
                break;
            case 'like':
                $query->where($field, 'LIKE' , '%' . $value . '%');
                break;
            case 'between':
                $query->whereBetween($field, $value);
                break;
        }
        return $query;
    }
}
