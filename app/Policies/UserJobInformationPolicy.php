<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserJobInformation;

class UserJobInformationPolicy extends BasePolicy
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
        return $user->can('view job information');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function view(User $user, UserJobInformation $userJobInformation)
    {
        return $user->can('view job information');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        //
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function update(User $user, UserJobInformation $userJobInformation)
    {
        return $user->can('edit job information');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function delete(User $user, UserJobInformation $userJobInformation)
    {
        return $user->can('delete job information');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function restore(User $user, UserJobInformation $userJobInformation)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function forceDelete(User $user, UserJobInformation $userJobInformation)
    {
        //
    }

    /**
     * Determine whether the user can permanently view his job information.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function viewSelfJobInformation(User $user, UserJobInformation $userJobInformation)
    {
        return $user->can('view self job information');
    }

    /**
     * Determine whether the user can permanently update his job information.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function updateSelfJobInformation(User $user, UserJobInformation $userJobInformation)
    {
        if ($user->can('edit self job information')) {
            return $user->id === $userJobInformation->user_id;
        }
    }

    /**
     * Determine whether the user can permanently view his job information.
     *
     * @param  User  $user
     * @param  UserJobInformation  $userJobInformation
     * @return mixed
     */
    public function deleteSelfJobInformation(User $user, UserJobInformation $userJobInformation)
    {
        if ($user->can('delete self job information')) {
            return $user->id === $userJobInformation->user_id;
        }
        return false;
    }
}
