<?php

namespace App\Services\Interfaces;


interface DashboardServiceInterface
{
    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getItemsByGroupedProjects(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds);

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getItemsForBarChart(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds);

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getProjectsTotalDuration(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds);

    /**
     * @param string $startDateTime
     * @param string $endDateTime
     * @param array $selectedUserIds
     * @param array $projectIds
     * @return mixed
     */
    public function getDurationDatas(string $startDateTime, string $endDateTime, array $selectedUserIds, array $projectIds);
}
