<?php

namespace App\Services;

use App\Services\Interfaces\DashboardServiceInterface;
use App\Repositories\DashboardRepository;


class DashboardService extends BaseService implements DashboardServiceInterface
{
    /**
     * DashboardService constructor.
     *
     * @param DashboardRepository $dashboardRepository
     */
    public function __construct(DashboardRepository $dashboardRepository)
    {
        parent::__construct($dashboardRepository);
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
        return $this->modelRepository->getItemsByGroupedProjects($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
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
        return $this->modelRepository->getItemsForBarChart($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
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
        return $this->modelRepository->getProjectsTotalDuration($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
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
        return $this->modelRepository->getDurationDatas($startDateTime, $endDateTime, $selectedUserIds, $projectIds);
    }


}
