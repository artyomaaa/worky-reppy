<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserLanguage;

class UserLanguagePolicy extends BasePolicy
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
        return $user->can('view language');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function view(User $user)
    {
        return $user->can('view language');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add language');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function update(User $user)
    {
        return $user->can('edit language');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function delete(User $user)
    {
        return $user->can('delete language');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\UserLanguage  $userLanguage
     * @return mixed
     */
    public function restore(User $user, UserLanguage $userLanguage)
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
        return $user->can('delete language');
    }

    /**
     * Determine whether the user can permanently view his language info.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewSelfLanguage(User $user)
    {
        return $user->can('view self language');
    }

    /**
     * Determine whether the user can permanently create language info for himself.
     *
     * @param  User  $user
     * @return mixed
     */
    public function createSelfLanguage(User $user)
    {
        return $user->can('add self language');
    }

    /**
     * Determine whether the user can permanently update his language info.
     *
     * @param  User  $user
     * @return mixed
     */
    public function updateSelfLanguage(User $user)
    {
        return $user->can('edit self language');
    }

    /**
     * Determine whether the user can permanently delete his language info.
     *
     * @param  User  $user
     * @param  UserLanguage $userLanguage
     * @return mixed
     */
    public function deleteSelfLanguage(User $user, UserLanguage $userLanguage)
    {
        if ($user->can('delete self language')) {
            return $user->id === $userLanguage->user_id;
        }
    }
}
