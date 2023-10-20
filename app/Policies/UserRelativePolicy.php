<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserRelative;

class UserRelativePolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any user relative.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view relative');
    }

    /**
     * Determine whether the user can view the user relative.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function view(User $user, UserRelative $userRelative)
    {
        return $user->can('view relative');
    }

    /**
     * Determine whether the user can create user relatives.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add relative');
    }

    /**
     * Determine whether the user can update the user relatives.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function update(User $user, UserRelative $userRelative)
    {
        return $user->can('edit relative');
    }

    /**
     * Determine whether the user can delete the user relative.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function delete(User $user, UserRelative $userRelative)
    {
        return $user->can('delete relative');
    }

    /**
     * Determine whether the user can permanently view his contacts.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function viewSelfRelative(User $user, UserRelative $userRelative)
    {
        if ($user->can('view self relative')) {
            return $user->id === $userRelative->user_id;
        }
    }

    /**
     * Determine whether the user can permanently create relative for himself.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function createSelfRelative(User $user, UserRelative $userRelative)
    {
        return $user->can('add self relative');
    }

    /**
     * Determine whether the user can permanently update his relative.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function updateSelfRelative(User $user, UserRelative $userRelative)
    {
        if ($user->can('edit self relative')) {
            return $user->id === $userRelative->user_id;
        }
    }

    /**
     * Determine whether the user can permanently delete his relative.
     *
     * @param  User  $user
     * @param  UserRelative  $userRelative
     * @return mixed
     */
    public function deleteSelfRelative(User $user, UserRelative $userRelative)
    {
        if ($user->can('delete self relative')) {
            return $user->id === $userRelative->user_id;
        }
    }
}
