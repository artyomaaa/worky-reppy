<?php

namespace App\Providers;

use App\Models\Report;
use App\Models\Tag;
use App\Models\Todo;
use App\Models\UserEducation;
use App\Models\UserLanguage;
use App\Models\UserVacation;
use App\Models\UserWorkHistory;
use App\Policies\FinancialListPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\TagPolicy;
use App\Policies\TeamPolicy;
use App\Policies\TodoPolicy;
use App\Policies\UserBonusPolicy;
use App\Policies\UserContactPolicy;
use App\Policies\UserDocumentPolicy;
use App\Policies\UserEducationPolicy;
use App\Policies\UserJobInformationPolicy;
use App\Policies\UserLanguagePolicy;
use App\Policies\UserRelativePolicy;
use App\Policies\UserSalaryPolicy;
use App\Policies\UserVacationPolicy;
use App\Policies\UserWorkHistoryPolicy;
use App\Policies\WorkPolicy;
use App\Models\Project;
use App\Models\Team;
use App\Models\UserBonus;
use App\Models\UserContact;
use App\Models\UserDocument;
use App\Models\UserJobInformation;
use App\Models\UserRelative;
use App\Models\UserSalary;
use App\Models\Work;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Model' => 'App\Policies\ModelPolicy',
        Todo::class => TodoPolicy::class,
        Tag::class => TagPolicy::class,
        Project::class => ProjectPolicy::class,
        Work::class => WorkPolicy::class,
        Team::class => TeamPolicy::class,
        UserContact::class => UserContactPolicy::class,
        UserDocument::class => UserDocumentPolicy::class,
        UserSalary::class => UserSalaryPolicy::class,
        UserBonus::class => UserBonusPolicy::class,
        UserRelative::class => UserRelativePolicy::class,
        UserJobInformation::class => UserJobInformationPolicy::class,
        UserWorkHistory::class => UserWorkHistoryPolicy::class,
        UserVacation::class => UserVacationPolicy::class,
        UserEducation::class => UserEducationPolicy::class,
        UserLanguage::class => UserLanguagePolicy::class,
        Report::class => FinancialListPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();

//        Passport::tokensExpireIn(now()->addDays(15));

//        Passport::refreshTokensExpireIn(now()->addDays(30));
    }
}
