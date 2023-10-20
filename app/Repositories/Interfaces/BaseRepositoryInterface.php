<?php

namespace App\Repositories\Interfaces;


use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use \Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface EloquentRepositoryInterface
 * @package App\Repositories
 */
interface BaseRepositoryInterface
{
    /**
     * @return Model
     */
    public function getModel(): Model;

    /**
     * Get query.
     * @return Builder
     */
    public function getQuery(): Builder;

    /**
     * @return Collection
     */
    public function all(): Collection;

    /**
     * @param array $attributes
     * @return Model
     */
    public function create(array $attributes): Model;

    /**
     * @param array $attributes
     *
     * @return bool
     */
    public function insert(array $attributes): bool;

    /**
     * @param int $id
     * @return Model
     */
    public function find(int $id) : ?Model;

    /**
     * @param array $attributes
     * @param int $id
     * @return bool|null
     */
    public function update(array $attributes, int $id) : ?bool;

    /**
     * @param int $id
     * @return bool|null
     */
    public function delete(int $id) : ?bool;

    /**
     * Paginate
     * @param Builder $query
     * @param int $pageSize
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function paginate(Builder $query, int $pageSize): ?LengthAwarePaginator;

    /**
     * Order by.
     * @param Builder $query
     * @param string $name
     * @return Builder
     */
    public function orderBy(Builder $query, string $name): Builder;

    /**
     * Add Condition To Query.
     * @param $type
     * @param $field
     * @param $value
     * @param $query
     * @param $condition
     * @return Builder
     */
    public function addConditionToQuery($field, $value, $query, $type = 'normal', $condition = '='): Builder;
}
