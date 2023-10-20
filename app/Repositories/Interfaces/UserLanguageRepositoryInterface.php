<?php
namespace App\Repositories\Interfaces;

interface UserLanguageRepositoryInterface
{
    /**
     * @param array $attributes
     * @param $id
     * @return bool
     */
    public function updateOrCreateLanguageInfo(array $attributes, $id): bool;

    /**
     * @param int $id
     * @param string $language
     * @return Mixed
     */
    public function selectLanguageByUserIdAndLanguageName(int $id, string $language);

    /**
     * @param int $id
     * @param string $language
     * @param array $attributes
     * @return bool
     */
    public function updateLanguageByUserIdAndLanguageName(int $id, string $language, array $attributes): bool;
}
