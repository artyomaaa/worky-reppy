<?php

namespace App\Services;

use App\Repositories\UserVacationRepository;
use App\Services\Interfaces\UserVacationServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class UserVacationService extends BaseService implements UserVacationServiceInterface
{
    /**
     * UserVacationService constructor.
     *
     * @param UserVacationRepository $userVacationRepository
     */
    public function __construct(UserVacationRepository $userVacationRepository)
    {
        parent::__construct($userVacationRepository);
    }

    /**
     * Get vacations info.
     * @param int $userId
     * @return Collection
     */
    public function getVacationsData(int $userId): ?Collection
    {
        return $this->modelRepository->getVacationsByUserId($userId);
    }

    /**
     * Get vacations info.
     * @param int $id
     * @param int $userId
     * @return Model
     */
    public function getVacationByIdAndUserId(int $id, int $userId): ?Model
    {
        return $this->modelRepository->getVacationByIdAndUserId($id, $userId);
    }

    /**
     * @param $request
     * @param int $id
     * @return bool
     */
    public function updateVacation($request, int $id): bool
    {
        $attributes = [
            'type' => $request->vacation_type,
            'status' => $request->vacation_status,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];

        return $this->modelRepository->updateVacation($id, $attributes);
    }

    /**
     * Create user vacation.
     *
     * @param $request
     * @return Model
     */
    public function createVacation($request): ?Model
    {
        $attributes = [
            'user_id' => $request->user_id,
            'type' => $request->vacation_type,
            'status' => $request->vacation_status,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];

        return $this->modelRepository->create($attributes);
    }
}
