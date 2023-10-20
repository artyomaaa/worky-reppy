<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Work;

class WorkPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any works.
     *
     * @param User $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view works');
    }

    /**
     * Determine whether the user can view the work.
     *
     * @param User $user
     * @param Work $work
     * @return mixed
     */
    public function view(User $user, Work $work)
    {
        if ($user->can('view works')) {
            return $user->id === $work->user_id;
        }
    }

    /**
     * Determine whether the user can create works.
     *
     * @param User $user
     * @return mixed
     */
    public function create(User $user)
    {
        if ($user->can('add works')) {
            return true;
        }
    }

    /**
     * Determine whether the user can update the work.
     *
     * @param User $user
     * @param Work $work
     * @return mixed
     */
    public function update(User $user, Work $work)
    {
        if ($user->can('edit works')) {
            return $user->id === $work->user_id;
        }
    }

    /**
     * Determine whether the user can delete the work.
     *
     * @param User $user
     * @param Work $work
     * @return mixed
     */
    public function delete(User $user, Work $work)
    {
        if ($user->can('delete works')) {
            return $user->id === $work->user_id;
        }
    }

    /**
     * Determine whether the user can restore the work.
     *
     * @param User $user
     * @param Work $work
     * @return mixed
     */
    public function restore(User $user, Work $work)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the work.
     *
     * @param User $user
     * @param Work $work
     * @return mixed
     */
    public function forceDelete(User $user, Work $work)
    {
        if ($user->can('delete works')) {
            return $user->id === $work->user_id;
        }
    }
}
