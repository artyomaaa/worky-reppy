<?php

namespace App\Services\Interfaces;

use Illuminate\Support\Collection;

interface ReportServiceInterface
{
    /**
     * Get Report Per User Items.
     *
     * @param  $loggedUser
     * @param  array $items
     * @return array
     */
    public function getReportPerUserItems($loggedUser, array $items): array;

    /**
     * Get Financial Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getFinancialReportItems(array $items): Collection;

    /**
     * Get Financial Report Items.
     *
     * @param  array $items
     * @return mixed
     */
    public function getEfforts(array $items);

    /**
     * Get Summary Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getSummaryReportItems(array $items): Collection;

    /**
     * Get Details Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getDetailsReportItems(array $items): Collection;

    /**
     * Get Grouped Projects.
     *
     * @param  array $items
     * @return Collection
     */
    public function getGroupedProjects(array $items): Collection;

    /**
     * Get Items By Grouped For BarChart.
     *
     * @param  array $items
     * @return Collection
     */
    public function getItemsByGroupedForBarChart(array $items): Collection;

    /**
     * Get Total Duration For Every Projects.
     *
     * @param  array $items
     * @return Collection
     */
    public function getTotalDurationForEveryProjects(array $items): Collection;

    /**
     * Get Projects Grouped Members Count.
     *
     * @param  array $items
     * @return array
     */
    public function getProjectsGroupedMembersCount(array $items): array;

    /**
     * Get Project Grouped Member List.
     *
     * @param  array $items
     * @return array
     */
    public function getProjectGroupedMemberList(array $items): array;
}
