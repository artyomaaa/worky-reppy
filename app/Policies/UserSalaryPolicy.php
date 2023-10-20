<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserSalary;

class UserSalaryPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any user salaries.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view salary');
    }

    /**
     * Determine whether the user can view the user salary.
     *
     * @param  User  $user
     * @param  UserSalary  $userSalary
     * @return mixed
     */
    public function view(User $user, UserSalary $userSalary)
    {
        return $user->can('view salary');
    }

    /**
     * Determine whether the user can create user salaries.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add salary');
    }

    /**
     * Determine whether the user can update the user salary.
     *
     * @param  User  $user
     * @param  UserSalary  $userSalary
     * @return mixed
     */
    public function update(User $user, UserSalary $userSalary)
    {
        if ($user->can('edit salary')) {
            return $user->id === $userSalary->user_id;
        }
    }

    /**
     * Determine whether the user can delete the user salary.
     *
     * @param  User  $user
     * @param  UserSalary  $userSalary
     * @return mixed
     */
    public function delete(User $user, UserSalary $userSalary)
    {
        if ($user->can('delete salary')) {
            return $user->id === $userSalary->user_id;
        }
    }

    /**
     * Determine whether the user can restore the user salary.
     *
     * @param  User  $user
     * @param  UserSalary  $userSalary
     * @return mixed
     */
    public function restore(User $user, UserSalary $userSalary)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the user salary.
     *
     * @param  User  $user
     * @param  UserSalary  $userSalary
     * @return mixed
     */
    public function forceDelete(User $user, UserSalary $userSalary)
    {
        //
    }

    /**
     * Determine whether the user can permanently view his salary.
     *
     * @param  User  $user
     * @param  UserSalary $userSalary
     * @return mixed
     */
    public function viewSelfSalary(User $user, UserSalary $userSalary)
    {
        if ($user->can('view self salary')) {
            return $user->id === $userSalary->user_id;
        }
    }
}
