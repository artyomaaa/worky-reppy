<?php

namespace App\Repositories;


use App\Models\Dashboard;
use App\Repositories\Interfaces\DashboardRepositoryInterface;

class DashboardRepository extends BaseRepository implements DashboardRepositoryInterface
{
    /**
     * UserRepository constructor.
     *
     * @param Dashboard $model
     */
    public function __construct(Dashboard $model)
    {
        parent::__construct($model);
    }

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getItemsByGroupedProjects(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds)
    {
        return $this->model->getItemsByGroupedProjects($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
    }

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getItemsForBarChart(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds)
    {
        return $this->model->getItemsForBarChart($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
    }

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getProjectsTotalDuration(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds)
    {
        return $this->model->getProjectsTotalDuration($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
    }

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getDurationDatas(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds)
    {
        return $this->model->getDurationDatas($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
    }

}
