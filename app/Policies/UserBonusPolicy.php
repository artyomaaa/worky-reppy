<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserBonus;

class UserBonusPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any user bonuses.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view bonus');
    }

    /**
     * Determine whether the user can view the user bonus.
     *
     * @param  User  $user
     * @param  UserBonus  $userBonus
     * @return mixed
     */
    public function view(User $user, UserBonus $userBonus)
    {
        return $user->can('view bonus');

    }

    /**
     * Determine whether the user can create user bonuses.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add bonus');
    }

    /**
     * Determine whether the user can update the user bonus.
     *
     * @param  User  $user
     * @param  UserBonus  $userBonus
     * @return mixed
     */
    public function update(User $user, UserBonus $userBonus)
    {
        if ($user->can('edit bonus')) {
            return $user->id === $userBonus->user_id;
        }
    }

    /**
     * Determine whether the user can delete the user bonus.
     *
     * @param  User  $user
     * @param  UserBonus  $userBonus
     * @return mixed
     */
    public function delete(User $user, UserBonus $userBonus)
    {
        if ($user->can('delete bonus')) {
            return $user->id === $userBonus->user_id;
        }
    }

    /**
     * Determine whether the user can restore the user bonus.
     *
     * @param  User  $user
     * @param  UserBonus  $userBonus
     * @return mixed
     */
    public function restore(User $user, UserBonus $userBonus)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the user bonus.
     *
     * @param  User  $user
     * @param  UserBonus  $userBonus
     * @return mixed
     */
    public function forceDelete(User $user, UserBonus $userBonus)
    {
        //
    }

    /**
     * Determine whether the user can permanently view his bonus.
     *
     * @param  User  $user
     * @param  UserBonus $userBonus
     * @return mixed
     */
    public function viewSelfBonus(User $user, UserBonus $userBonus)
    {
        if ($user->can('view self bonus')) {
            return $user->id === $userBonus->user_id;
        }
    }
}
