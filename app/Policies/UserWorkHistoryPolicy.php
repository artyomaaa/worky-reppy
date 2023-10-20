<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserWorkHistory;

class UserWorkHistoryPolicy extends BasePolicy
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
        return $user->can('view day note');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function view(User $user)
    {
        return $user->can('view day note');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add day note');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function update(User $user)
    {
        return $user->can('edit day note');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  User  $user
     * @return mixed
     */
    public function delete(User $user)
    {
        return $user->can('delete day note');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  User  $user
     * @param  UserWorkHistory  $userWorkHistory
     * @return mixed
     */
    public function restore(User $user, UserWorkHistory $userWorkHistory)
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
        return $user->can('delete day note');
    }

    /**
     * Determine whether the user can permanently view his day note.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewSelfDayNote(User $user)
    {
        return $user->can('view self day note');
    }

    /**
     * Determine whether the user can permanently create day note for himself.
     *
     * @param  User  $user
     * @return mixed
     */
    public function createSelfDayNote(User $user)
    {
        return $user->can('add self day note');
    }

    /**
     * Determine whether the user can permanently update his day note.
     *
     * @param  User  $user
     * @param  UserWorkHistory $userWorkHistory
     * @return mixed
     */
    public function updateSelfDayNote(User $user, UserWorkHistory $userWorkHistory)
    {
        if ($user->can('edit self day note')) {
            return $user->id === $userWorkHistory->user_id;
        }
    }

    /**
     * Determine whether the user can permanently delete his day note.
     *
     * @param  User  $user
     * @param  UserWorkHistory $userWorkHistory
     * @return mixed
     */
    public function deleteSelfDayNote(User $user, UserWorkHistory $userWorkHistory)
    {
        if ($user->can('delete self day note')) {
            return $user->id === $userWorkHistory->user_id;
        }
    }
}
