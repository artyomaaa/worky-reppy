<?php

namespace App\Providers;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Pagination\Paginator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Schema::defaultStringLength(191);

        Paginator::useBootstrap();

        // Implicitly grant "Administrator" role all permissions
        // This works in the app by using gate-related functions like auth()->user->can() and @can()
//        Gate::before(function ($user, $ability) {
//            return $user->hasHighestRole() ? true : null;
//        });

        Gate::after(function ($user, $ability, $result, $arguments) {
            if ($user
                && !$result
                && (in_array('checkTeamsProjects', $arguments)) // important
                ) {
                $teamIds = [];
                $projectIds = [];
                if (!empty($arguments)) {
                    foreach ($arguments as $items) {
                        if (!empty($items['teamIds'])) {
                            array_push($teamIds, $items['teamIds']);
                        }
                        if (!empty($items['projectIds'])) {
                            array_push($projectIds, $items['projectIds']);
                        }
                    }
                }
                $teamIds = array_unique($teamIds);
                $projectIds = array_unique($projectIds);
                // Here we need to check TeamMemberRole and UserProjectRole permissions
                $teamMembersRolePermissions = $user->teamMembersRolePermissions($teamIds);
                foreach ($teamMembersRolePermissions as $teamId => $teamPermissions) {
                    if (in_array($ability, $teamPermissions)) {
                        return true;
                    }
                }
                $userProjectsRolePermissions = $user->userProjectsRolePermissions($projectIds);
                foreach ($userProjectsRolePermissions as $projectId => $projectPermissions) {
                    if (in_array($ability, $projectPermissions)) {
                        return true;
                    }
                }
            }
        });

        Builder::macro('fullSql', function () {
            $sql = str_replace(['%', '?'], ['%%', '%s'], $this->toSql());

            $handledBindings = array_map(function ($binding) {
                if (is_numeric($binding)) {
                    return $binding;
                }

                $value = str_replace(['\\', "'"], ['\\\\', "\'"], $binding);

                return "'{$value}'";
            }, $this->getConnection()->prepareBindings($this->getBindings()));

            $fullSql = vsprintf($sql, $handledBindings);

            return $fullSql;
        });

        Builder::macro('ddd', function () {
            dd($this->fullSql());
        });
    }
}
