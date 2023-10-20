<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserEducation;

class UserEducationPolicy extends BasePolicy
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
        return $user->can('view education');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  User  $user

     * @return mixed
     */
    public function view(User $user)
    {
        return $user->can('view education');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add education');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function update(User $user)
    {
        return $user->can('edit education');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function delete(User $user)
    {
        return $user->can('delete education');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  User  $user
     * @param  UserEducation  $userEducation
     * @return mixed
     */
    public function restore(User $user, UserEducation $userEducation)
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
        return $user->can('delete education');
    }

    /**
     * Determine whether the user can permanently view his education info.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewSelfEducation(User $user)
    {
        return $user->can('view self education');
    }

    /**
     * Determine whether the user can permanently create education info for himself.
     *
     * @param  User  $user
     * @return mixed
     */
    public function createSelfEducation(User $user)
    {
        return $user->can('add self education');
    }

    /**
     * Determine whether the user can permanently update his education info.
     *
     * @param  User  $user
     * @return mixed
     */
    public function updateSelfEducation(User $user)
    {
        return $user->can('edit self education');
    }

    /**
     * Determine whether the user can permanently delete his education info.
     *
     * @param  User  $user
     * @param  UserEducation  $userEducation
     * @return mixed
     */
    public function deleteSelfEducation(User $user, UserEducation  $userEducation)
    {
        if ($user->can('delete self education')) {
            return $user->id === $userEducation->user_id;
        }
    }
}
