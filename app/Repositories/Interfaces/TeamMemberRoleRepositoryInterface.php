<?php
namespace App\Repositories\Interfaces;

interface TeamMemberRoleRepositoryInterface
{
    /**
     * @return array
     */
    public function roleNames(): array;

    /**
     * @param int $roleId
     * @param int $page
     * @param int $perPage
     * @return mixed
     */
    public function getMemberList(int $roleId, $page = 1, $perPage = 10);

    /**
     * @param int $roleId
     * @return mixed
     */
    public function getAllUserList(int $roleId);
}
