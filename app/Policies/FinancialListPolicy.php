<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class FinancialListPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view the Financial List Report.
     *
     * @param  User $user
     * @param  Report  $report
     * @return mixed
     */
    public function viewFinancialList(User $user,Report  $report)
    {
        return $user->can('view financial list');
    }
}
