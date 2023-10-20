<?php

namespace App\Repositories;

use App\Models\Report;
use App\Repositories\Interfaces\ReportRepositoryInterface;
use Illuminate\Support\Collection;

class ReportRepository extends BaseRepository implements ReportRepositoryInterface
{
    /**
     * ReportRepository constructor.
     *
     * @param Report $model
     */
    public function __construct(Report $model)
    {
        parent::__construct($model);
    }

    /**
     * Get Report Per User Items.
     *
     * @param  $loggedUser
     * @param  array $items
     * @return array
     */
    public function getReportPerUserItems($loggedUser, array $items): array
    {
        return $this->model->getUserReportItems(
            $loggedUser,
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Financial Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getFinancialReportItems(array $items): Collection
    {
        return $this->model->getFinancialItems(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectStatus'],
            $items['projectType'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Summary Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getSummaryReportItems(array $items): Collection
    {
        return $this->model->getSummaryItems(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectStatus'],
            $items['projectType'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Details Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getDetailsReportItems(array $items): Collection
    {
        return $this->model->getDetailsItems(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectStatus'],
            $items['projectType'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Grouped Projects.
     *
     * @param  array $items
     * @return Collection
     */
    public function getGroupedProjects(array $items): Collection
    {
        return $this->model->getGroupedProjects(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectStatus'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Items By Grouped For BarChart.
     *
     * @param  array $items
     * @return Collection
     */
    public function getItemsByGroupedForBarChart(array $items): Collection
    {
        return $this->model->getItemsByGroupedForBarChart(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Total Duration For Every Projects.
     *
     * @param  array $items
     * @return Collection
     */
    public function getTotalDurationForEveryProjects(array $items): Collection
    {
        return $this->model->getTotalDurationForEveryProjects(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Projects Grouped Members Count.
     *
     * @param  array $items
     * @return array
     */
    public function getProjectsGroupedMembersCount(array $items): array
    {
        return $this->model->getProjectsGroupedMembersCount(
            $items['startDateTime'],
            $items['endDateTime'],
            $items['projectIds'],
            $items['selectedUserIds']
        );
    }

    /**
     * Get Project Grouped Member List.
     *
     * @param  array $items
     * @return array
     */
    public function getProjectGroupedMemberList(array $items): array
    {
        return $this->model->getProjectGroupedMemberList(
            $items['startDateTime'],
            $items['endDateTime'],
            [$items['projectIds']],
            $items['selectedUserIds']
        );
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getProjectTimeReport(array $items)
    {
        $query = $this->_getReportsViewQueryByFilter($items)
                        ->select([
                        'work_user_id',
                        'project_id',
                        'work_user_name as user_name',
                        'work_user_surname as user_surname',
                        'work_user_avatar',
                        'project_name',
                        'project_color',
                        \DB::raw('0 as reported_time'),
                        \DB::raw('SUM(duration) as worked_time')
                    ]);
        $reports = $query->paginate((int)$items['pageSize'], ['*'], 'page', (int)$items['page']);
        $reportsArr = $reports->toArray();

        $userIds = [];
        foreach ($reportsArr['data'] as $report) {
            $userIds[] = $report->work_user_id;
        }
        $items['selectedUserIds'] = array_unique($userIds); // important
        $clientHours = $this->_getClientHoursQueryByFilter($items)
            ->select([
                'client_hours.*',
                'users.name as user_name',
                'users.surname as user_surname',
                'users.avatar as user_avatar',
                'projects.name as project_name',
                'projects.color as project_color',
                \DB::raw('0 as worked_time'),
                \DB::raw('SUM(client_hours.time) as reported_time')
            ])
            ->get();

        foreach ($reportsArr['data'] as $report) {
            foreach ($clientHours as $clientHour) {
                if ($clientHour->user_id === $report->work_user_id
                    && $clientHour->project_id === $report->project_id
                ) {
                    $report->reported_time = (int)$clientHour->reported_time;
                }
            }
        }

        return $reportsArr;
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getProjectTimeExportData(array $items)
    {
        $reports = $this->_getReportsViewQueryByFilter($items)
            ->select([
                'work_user_id',
                'project_id',
                'work_user_name as user_name',
                'work_user_surname as user_surname',
                'work_user_avatar',
                'project_name',
                'project_color',
                \DB::raw('0 as reported_time'),
                \DB::raw('SUM(duration) as worked_time')
            ])
            ->get();
        $userIds = $reports->pluck('work_user_id')->toArray();
        $items['selectedUserIds'] = array_unique($userIds); // important
        $clientHours = $this->_getClientHoursQueryByFilter($items)
            ->select([
                'client_hours.user_id',
                'client_hours.project_id',
                'users.name as user_name',
                'users.surname as user_surname',
                'projects.name as project_name',
                \DB::raw('0 as worked_time'),
                \DB::raw('SUM(client_hours.time) as reported_time')
            ])
            ->get();

        foreach ($reports as $report) {
            foreach ($clientHours as $clientHour) {
                if ($clientHour->user_id === $report->work_user_id
                    && $clientHour->project_id === $report->project_id
                ) {
                    $report->reported_time = (int)$clientHour->reported_time;
                }
            }
        }

        return $reports;
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function _getClientHoursQueryByFilter(array $items)
    {
        $query = \DB::table('client_hours')
            ->join('users', 'users.id', '=', 'client_hours.user_id')
            ->join('projects', 'projects.id', '=', 'client_hours.project_id');

        if (!empty($items['projectIds'])) {
            $projectIds = array_unique($items['projectIds']);
            if (!in_array('0', $projectIds)) { // not selected No Projects
                $query->whereIn('client_hours.project_id', $projectIds);
            } else { // selected No Projects
                $query->where(function($q) use($projectIds){
                    $q->whereIn('client_hours.project_id', $projectIds)
                        ->orWhereNull('client_hours.project_id');
                });
            }
        }
        if (!empty($items['selectedUserIds'])) {
            $query->whereIn('client_hours.user_id', $items['selectedUserIds']);
        }

        if (!empty($items['startDateTime'])) {
            $query->whereDate('client_hours.date', '>=', $items['startDateTime']);
        }

        if (!empty($items['endDateTime'])) {
            $query->whereDate('client_hours.date', '<=', $items['endDateTime']);
        }

        return $query->groupBy(\DB::raw('client_hours.user_id, client_hours.project_id, client_hours.date'));
    }

    /**
     * @param array $items
     * @return mixed
     */
    private function _getReportsViewQueryByFilter(array $items)
    {
        $query = \DB::table('reports_view');

        if (!empty($items['projectIds'])) {
            $projectIds = array_unique($items['projectIds']);
            if (!in_array('0', $projectIds)) { // not selected No Projects
                $query->whereIn('project_id', $projectIds);
            } else { // selected No Projects
                $query->where(function($q) use($projectIds){
                    $q->whereIn('project_id', $projectIds)
                        ->orWhereNull('project_id');
                });
            }
        }
        if (!empty($items['selectedUserIds'])) {
            $query->whereIn('work_user_id', $items['selectedUserIds']);
        }

        if (!empty($items['startDateTime'])) {
            $query->where('start_date_time', '>=', $items['startDateTime']);
        }

        if (!empty($items['endDateTime'])) {
            // we are using start_date_time instead of end_date_time
            // here we have situation when end_date_time is null
            $query->where('start_date_time', '<=', $items['endDateTime']);
        }

        return $query->groupBy(\DB::raw('work_user_id, project_id'));
    }
}
