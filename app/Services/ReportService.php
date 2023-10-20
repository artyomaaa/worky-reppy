<?php

namespace App\Services;

use App\Models\Project;
use App\Repositories\ReportRepository;
use App\Services\Interfaces\ReportServiceInterface;
use Illuminate\Support\Collection;

class ReportService extends BaseService implements ReportServiceInterface
{
    /**
     * ReportService constructor.
     *
     * @param ReportRepository $reportRepository
     */
    public function __construct(ReportRepository $reportRepository)
    {
        parent::__construct($reportRepository);
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
        if (!$items) return [];

        return $this->modelRepository->getReportPerUserItems($loggedUser, $items);
    }

    /**
     * Get Financial Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getFinancialReportItems(array $items): Collection
    {
        return $this->modelRepository->getFinancialReportItems($items);
    }

    /**
     * Get Summary Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getSummaryReportItems(array $items): Collection
    {
        return $this->modelRepository->getSummaryReportItems($items);
    }

    /**
     * Get Details Report Items.
     *
     * @param  array $items
     * @return Collection
     */
    public function getDetailsReportItems(array $items): Collection
    {
        return $this->modelRepository->getDetailsReportItems($items);
    }

    /**
     * Get Grouped Projects.
     *
     * @param  array $items
     * @return Collection
     */
    public function getGroupedProjects(array $items): Collection
    {
        return $this->modelRepository->getGroupedProjects($items);
    }

    /**
     * Get Items By Grouped For BarChart.
     *
     * @param  array $items
     * @return Collection
     */
    public function getItemsByGroupedForBarChart(array $items): Collection
    {
        return $this->modelRepository->getItemsByGroupedForBarChart($items);
    }

    /**
     * Get Total Duration For Every Projects.
     *
     * @param  array $items
     * @return Collection
     */
    public function getTotalDurationForEveryProjects(array $items): Collection
    {
        return $this->modelRepository->getTotalDurationForEveryProjects($items);
    }

    /**
     * Get Projects Grouped Members Count.
     *
     * @param  array $items
     * @return array
     */
    public function getProjectsGroupedMembersCount(array $items): array
    {
        return $this->modelRepository->getProjectsGroupedMembersCount($items);
    }

    /**
     * Get Project Grouped Member List.
     *
     * @param  array $items
     * @return array
     */
    public function getProjectGroupedMemberList(array $items): array
    {
        return $this->modelRepository->getProjectGroupedMemberList($items);
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getProjectTimeReport(array $items)
    {
        return $this->modelRepository->getProjectTimeReport($items);
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getProjectTimeExportData(array $items)
    {
        return $this->modelRepository->getProjectTimeExportData($items);
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getNowWorkingOnReport(array $items)
    {
        $query = \DB::table('reports_view')
            ->whereNull('reports_view.end_date_time')
            ->whereRaw('DATE(reports_view.start_date_time) = CURDATE()')
            ->orderBy('reports_view.start_date_time', 'desc')
            ->select([
                'work_id',
                'work_name',
                'work_time_id',
                'work_user_id',
                'work_user_name',
                'work_user_surname',
                'work_user_avatar',
                'start_date_time',
                'project_id',
                'project_name',
                'project_color',
                \DB::raw("TIME_FORMAT(TIMEDIFF(UTC_TIMESTAMP(), start_date_time),'%H:%i') as duration")
            ]);

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

       return $query->paginate((int)$items['pageSize'], ['*'], 'page', (int)$items['page']);
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getEfforts(array $items)
    {
        $query = \DB::table('reports_view')
            ->where('submitted', 1) // maybe no need
            ->orderBy(\DB::raw('reports_view.project_id, reports_view.start_date'))
            ->select([
                'work_id',
                'work_name',
                'work_time_id',
                'work_user_id',
                'work_user_name',
                'work_user_surname',
                'work_user_avatar',
                'start_date',
                \DB::raw('MIN(reports_view.start_date_time) as start_date_time'),
                \DB::raw('MAX(reports_view.end_date_time) as end_date_time'),
                'duration',
                'project_id',
                'project_name',
                'project_color',
                \DB::raw('SUM((
                   CASE
                       WHEN reports_view.end_date_time IS NULL THEN (SELECT TIME_TO_SEC(TIMEDIFF(NOW(), reports_view.start_date_time)) as duration)
                       ELSE (SELECT TIME_TO_SEC(TIMEDIFF(reports_view.end_date_time, reports_view.start_date_time)) as duration)
                       END
                   )) as worked_time')
            ]);

        if (!empty($items['startDateTime'])) {
            $query->where('start_date_time', '>=', $items['startDateTime']);
        }
        if (!empty($items['endDateTime'])) {
            $endDateTime = $items['endDateTime'];
            $query->where(function ($q) use ($endDateTime) {
                $q->where('end_date_time',  '<=', $endDateTime)
                    ->orWhereNull('end_date_time');
            });
        }

        if (isset($items['projectStatus']) && $items['projectStatus'] == Project::ACTIVE) {
            $query->where(function ($query) use ($items) {
                $query->where('project_status', '=', $items['projectStatus']);
                $query->orWhere('project_id', '=', null);
            });
        } elseif (isset($items['projectStatus']) && $items['projectStatus'] == Project::INACTIVE) {
            $query->where('project_status', Project::INACTIVE);
        }

        if (!empty($items['projectIds'])) {
            $projectIds = array_unique($items['projectIds']);
            if (!in_array('0', $projectIds)) { // not selected No Projects
                $query->whereIn('project_id', $projectIds);
            } else { // selected No Projects
                $query->where(function ($q) use ($projectIds) {
                    $q->whereIn('project_id', $projectIds)
                        ->orWhereNull('project_id');
                });
            }
        }
        $query->whereIn('work_user_id', $items['selectedUserIds']);
        $query->groupBy(['work_user_id', 'project_id', 'start_date']);

        return $query;
    }

    /**
     * @param array $items
     * @return mixed
     */
    public function getClientHours(array $items)
    {
        return $this->modelRepository->_getClientHoursQueryByFilter($items)
            ->select([
                'client_hours.user_id',
                'client_hours.project_id',
                'client_hours.date',
                'time as reported_time',
            ])
            ->get();
    }
}
