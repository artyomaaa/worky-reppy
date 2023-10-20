<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserVacation;

class UserVacationPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any models.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view vacation');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function view(User $user)
    {
        return $user->can('view vacation');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add vacation');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function update(User $user)
    {
        return $user->can('edit vacation');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function delete(User $user)
    {
        return $user->can('delete vacation');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  User  $user
     * @param  UserVacation  $userVacation
     * @return mixed
     */
    public function restore(User $user, UserVacation $userVacation)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function forceDelete(User $user)
    {
        return $user->can('delete vacation');
    }

    /**
     * Determine whether the user can permanently view his vacation.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewSelfVacation(User $user)
    {
        return $user->can('view self vacation');
    }

    /**
     * Determine whether the user can permanently create vacation for himself.
     *
     * @param  User  $user
     * @return mixed
     */
    public function createSelfVacation(User $user)
    {
        return $user->can('add self vacation');
    }

    /**
     * Determine whether the user can permanently update his vacation.
     *
     * @param  User  $user
     * @param  UserVacation  $userVacation
     * @return mixed
     */
    public function updateSelfVacation(User $user, UserVacation  $userVacation)
    {
        if ($user->can('edit self vacation')) {
            return $user->id === $userVacation->user_id;
        }
    }

    /**
     * Determine whether the user can permanently delete his vacation.
     *
     * @param  User  $user
     * @param  UserVacation  $userVacation
     * @return mixed
     */
    public function deleteSelfVacation(User $user, UserVacation  $userVacation)
    {
        if ($user->can('delete self vacation')) {
            return $user->id === $userVacation->user_id;
        }
    }
}
