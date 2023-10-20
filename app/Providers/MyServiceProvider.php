<?php

namespace App\Providers;

use App\Models\ClientHour;
use App\Models\Permission;
use App\Models\Project;
use App\Models\Tag;
use App\Models\ProjectTechnology;
use App\Models\Report;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\TeamMemberRole;
use App\Models\Technology;
use App\Models\Todo;
use App\Models\UserProject;
use App\Models\UserProjectRole;
use App\Models\UserVacation;
use App\Models\UserWorkHistory;
use App\Models\UserJobInformation;
use App\Models\UserEducation;
use App\Models\UserLanguage;
use App\Models\Work;
use App\Models\WorkTime;
use App\Models\WorkTimeTag;
use App\Repositories\ClientHourRepository;
use App\Repositories\PermissionRepository;
use App\Repositories\TagRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\ProjectTechnologyRepository;
use App\Repositories\ReportRepository;
use App\Repositories\TeamMemberRepository;
use App\Repositories\TeamRepository;
use App\Repositories\TeamMemberRoleRepository;
use App\Repositories\TechnologyRepository;
use App\Repositories\TodoRepository;
use App\Repositories\UserProjectRepository;
use App\Repositories\UserProjectRoleRepository;
use App\Repositories\UserVacationRepository;
use App\Repositories\UserWorkHistoryRepository;
use App\Repositories\UserJobInformationRepository;
use App\Repositories\UserEducationRepository;
use App\Repositories\UserLanguageRepository;
use App\Repositories\WorkRepository;
use App\Repositories\WorkTimeRepository;
use App\Repositories\WorkTimeTagRepository;
use App\Services\ClientHourService;
use App\Services\Interfaces\ClientHourServiceInterface;
use App\Services\Interfaces\PermissionServiceInterface;
use App\Services\Interfaces\TagServiceInterface;
use App\Services\Interfaces\ProjectServiceInterface;
use App\Services\Interfaces\ProjectTechnologyServiceInterface;
use App\Services\Interfaces\ReportServiceInterface;
use App\Services\Interfaces\TeamMemberServiceInterface;
use App\Services\Interfaces\TeamMemberRoleServiceInterface;
use App\Services\Interfaces\TeamServiceInterface;
use App\Services\Interfaces\TechnologyServiceInterface;
use App\Services\Interfaces\TodoServiceInterface;
use App\Services\Interfaces\UserProjectRoleServiceInterface;
use App\Services\Interfaces\UserProjectServiceInterface;
use App\Services\Interfaces\UserVacationServiceInterface;
use App\Services\Interfaces\UserWorkHistoryServiceInterface;
use App\Services\Interfaces\UserJobInformationServiceInterface;
use App\Services\Interfaces\UserEducationServiceInterface;
use App\Services\Interfaces\UserLanguageServiceInterface;
use App\Services\Interfaces\WorkServiceInterface;
use App\Services\Interfaces\WorkTimeServiceInterface;
use App\Services\Interfaces\WorkTimeTagServiceInterface;
use App\Services\PermissionService;
use App\Services\TagService;
use App\Services\ProjectService;
use App\Services\ProjectTechnologyService;
use App\Services\ReportService;
use App\Services\TeamMemberService;
use App\Services\TeamMemberRoleService;
use App\Services\TeamService;
use App\Services\TechnologyService;
use App\Services\TodoService;
use App\Services\UserProjectRoleService;
use App\Services\UserProjectService;
use App\Services\UserVacationService;
use App\Services\UserWorkHistoryService;
use App\Services\UserJobInformationService;
use App\Services\UserEducationService;
use App\Services\UserLanguageService;
use App\Services\WorkService;
use App\Services\WorkTimeService;
use App\Services\WorkTimeTagService;
use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Models\Dashboard;
use App\Repositories\UserRepository;
use App\Repositories\DashboardRepository;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\Interfaces\DashboardServiceInterface;
use App\Services\UserService;
use App\Services\DashboardService;

use App\Models\Role;
use App\Repositories\RoleRepository;
use App\Services\Interfaces\RoleServiceInterface;
use App\Services\RoleService;

class MyServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->app->bind(UserServiceInterface::class, function ($app) {
            return new UserService(new UserRepository(new User()));
        });

        $this->app->bind(RoleServiceInterface::class, function ($app) {
            return new RoleService(new RoleRepository(new Role()));
        });

        $this->app->bind(PermissionServiceInterface::class, function ($app) {
            return new PermissionService(new PermissionRepository(new Permission()));
        });

        $this->app->bind(TeamServiceInterface::class, function ($app) {
            return new TeamService(new TeamRepository(new Team()));
        });

        $this->app->bind(TeamMemberServiceInterface::class, function ($app) {
            return new TeamMemberService(new TeamMemberRepository(new TeamMember()));
        });

        $this->app->bind(TeamMemberRoleServiceInterface::class, function ($app) {
            return new TeamMemberRoleService(new TeamMemberRoleRepository(new TeamMemberRole()));
        });

        $this->app->bind(TagServiceInterface::class, function ($app) {
            return new TagService(new TagRepository(new Tag()));
        });

        $this->app->bind(ProjectServiceInterface::class, function ($app) {
            return new ProjectService(new ProjectRepository(new Project()));
        });

        $this->app->bind(UserWorkHistoryServiceInterface::class, function ($app) {
            return new UserWorkHistoryService(new UserWorkHistoryRepository(new UserWorkHistory()));
        });

        $this->app->bind(UserVacationServiceInterface::class, function ($app) {
            return new UserVacationService(new UserVacationRepository(new UserVacation()));
        });

        $this->app->bind(UserEducationServiceInterface::class, function ($app) {
            return new UserEducationService(new UserEducationRepository(new UserEducation()));
        });

        $this->app->bind(UserJobInformationServiceInterface::class, function ($app) {
            return new UserJobInformationService(new UserJobInformationRepository(new UserJobInformation()));
        });

        $this->app->bind(UserLanguageServiceInterface::class, function ($app) {
            return new UserLanguageService(new UserLanguageRepository(new UserLanguage()));
        });

        $this->app->bind(ReportServiceInterface::class, function ($app) {
            return new ReportService(new ReportRepository(new Report()));
        });

        $this->app->bind(UserProjectServiceInterface::class, function ($app) {
            return new UserProjectService(new UserProjectRepository(new UserProject()));
        });

        $this->app->bind(UserProjectRoleServiceInterface::class, function ($app) {
            return new UserProjectRoleService(new UserProjectRoleRepository(new UserProjectRole()));
        });

        $this->app->bind(TechnologyServiceInterface::class, function ($app) {
            return new TechnologyService(new TechnologyRepository(new Technology()));
        });

        $this->app->bind(ProjectTechnologyServiceInterface::class, function ($app) {
            return new ProjectTechnologyService(new ProjectTechnologyRepository(new ProjectTechnology()));
        });

        $this->app->bind(WorkServiceInterface::class, function ($app) {
            return new WorkService(new WorkRepository(new Work()));
        });

        $this->app->bind(WorkTimeServiceInterface::class, function ($app) {
            return new WorkTimeService(new WorkTimeRepository(new WorkTime()));
        });

        $this->app->bind(WorkTimeTagServiceInterface::class, function ($app) {
            return new WorkTimeTagService(new WorkTimeTagRepository(new WorkTimeTag()));
        });

        $this->app->bind(TodoServiceInterface::class, function ($app) {
            return new TodoService(new TodoRepository(new Todo()));
        });

        $this->app->bind(ClientHourServiceInterface::class, function ($app) {
            return new ClientHourService(new ClientHourRepository(new ClientHour()));
        });

        $this->app->bind(DashboardServiceInterface::class, function ($app) {
            return new DashboardService(new DashboardRepository(new Dashboard()));
        });
    }
}
