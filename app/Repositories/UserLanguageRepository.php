<?php

namespace App\Repositories;

use App\Models\UserLanguage;
use App\Repositories\Interfaces\UserLanguageRepositoryInterface;

class UserLanguageRepository extends BaseRepository implements UserLanguageRepositoryInterface
{
    /**
     * UserLanguageRepository constructor.
     *
     * @param UserLanguage $model
     */
    public function __construct(UserLanguage $model)
    {
        parent::__construct($model);
    }

    /**
     * @param array $attributes
     * @param $id
     * @return bool
     */
    public function updateOrCreateLanguageInfo(array $attributes, $id): bool
    {
        return $id
            ? (bool) $this->update($attributes, $id)
            : (bool) $this->create($attributes);
    }

    /**
     * @param int $id
     * @param string $language
     * @return Mixed
     */
    public function selectLanguageByUserIdAndLanguageName(int $id, string $language)
    {
        return $this->model->where('user_id', $id)->where('language', $language)->first();
    }

    /**
     * @param int $id
     * @param string $language
     * @param array $attributes
     * @return bool
     */
    public function updateLanguageByUserIdAndLanguageName(int $id, string $language, array $attributes): bool
    {
        return $this->model->where('user_id', $id)->where('language', $language)->update($attributes);
    }
}
