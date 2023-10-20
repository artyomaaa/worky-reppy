<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserDocument;

class UserDocumentPolicy extends BasePolicy
{
    public function before($user, $ability)
    {
        parent::before($user, $ability);
    }

    /**
     * Determine whether the user can view any user documents.
     *
     * @param  User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return $user->can('view documents');
    }

    /**
     * Determine whether the user can view the user document.
     *
     * @param  User  $user
     * @param  UserDocument  $userDocument
     * @return mixed
     */
    public function view(User $user, UserDocument $userDocument)
    {
        return $user->can('view documents');
    }

    /**
     * Determine whether the user can create user documents.
     *
     * @param  User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->can('add documents');
    }

    /**
     * Determine whether the user can update the user document.
     *
     * @param  User  $user
     * @param  UserDocument  $userDocument
     * @return mixed
     */
    public function update(User $user, UserDocument $userDocument)
    {
        return $user->can('edit documents');
    }

    /**
     * Determine whether the user can delete the user document.
     *
     * @param  User  $user
     * @param  UserDocument  $userDocument
     * @return mixed
     */
    public function delete(User $user, UserDocument $userDocument)
    {
        return $user->can('delete documents');
    }

    /**
     * Determine whether the user can restore the user document.
     *
     * @param  User  $user
     * @param  UserDocument  $userDocument
     * @return mixed
     */
    public function restore(User $user, UserDocument $userDocument)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the user document.
     *
     * @param  User  $user
     * @param  UserDocument  $userDocument
     * @return mixed
     */
    public function forceDelete(User $user, UserDocument $userDocument)
    {
        return $user->can('delete documents');
    }

    /**
     * Determine whether the user can permanently view his documents.
     *
     * @param  User  $user
     * @param  UserDocument $userDocument
     * @return mixed
     */
    public function viewSelfDocuments(User $user, UserDocument $userDocument)
    {
        return $user->can('view self documents');
    }

    /**
     * Determine whether the user can permanently create documents for himself.
     *
     * @param  User  $user
     * @param  UserDocument $userDocument
     * @return mixed
     */
    public function createSelfDocuments(User $user, UserDocument $userDocument)
    {
        return $user->can('add self documents');
    }

    /**
     * Determine whether the user can permanently update his documents.
     *
     * @param  User  $user
     * @param  UserDocument $userDocument
     * @return mixed
     */
    public function updateSelfDocuments(User $user, UserDocument $userDocument)
    {
        if ($user->can('edit self documents')) {
            return $user->id === $userDocument->user_id;
        }
    }

    /**
     * Determine whether the user can permanently delete his documents.
     *
     * @param  User  $user
     * @param  UserDocument $userDocument
     * @return mixed
     */
    public function deleteSelfDocuments(User $user, UserDocument $userDocument)
    {
        if ($user->can('delete self documents')) {
            return $user->id === $userDocument->user_id;
        }
    }
}
