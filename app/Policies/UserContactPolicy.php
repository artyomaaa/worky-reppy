<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserContact;

class UserContactPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any user contacts.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view contacts');
    }

    /**
     * Determine whether the user can view the user contact.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function view(User $user, UserContact $userContact)
    {
        return $user->can('view contacts');
    }

    /**
     * Determine whether the user can create user contacts.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add contacts');
    }

    /**
     * Determine whether the user can update the user contact.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function update(User $user, UserContact $userContact)
    {
        return $user->can('edit contacts');
    }

    /**
     * Determine whether the user can delete the user contact.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function delete(User $user, UserContact $userContact)
    {
        return $user->can('delete contacts');
    }

    /**
     * Determine whether the user can restore the user contact.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function restore(User $user, UserContact $userContact)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the user contact.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function forceDelete(User $user, UserContact $userContact)
    {
        return $user->can('delete contacts');
    }

    /**
     * Determine whether the user can permanently view his contacts.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function viewSelfContacts(User $user, UserContact $userContact)
    {
        if ($user->can('view self contacts')) {
            return $user->id === $userContact->user_id;
        }
    }

    /**
     * Determine whether the user can permanently create contacts for himself.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function createSelfContacts(User $user, UserContact $userContact)
    {
        return $user->can('add self contacts');
    }

    /**
     * Determine whether the user can permanently update his contacts.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function updateSelfContacts(User $user, UserContact $userContact)
    {
        if ($user->can('edit self contacts')) {
            return $user->id === $userContact->user_id;
        }
    }

    /**
     * Determine whether the user can permanently delete his contacts.
     *
     * @param  User  $user
     * @param  UserContact  $userContact
     * @return mixed
     */
    public function deleteSelfContacts(User $user, UserContact $userContact)
    {
        if ($user->can('delete self contacts')) {
            return $user->id === $userContact->user_id;
        }
    }
}
