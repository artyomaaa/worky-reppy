<?php

namespace App\Services;

use App\Repositories\UserLanguageRepository;
use App\Services\Interfaces\UserLanguageServiceInterface;

class UserLanguageService extends BaseService implements UserLanguageServiceInterface
{
    /**
     * UserLanguageService constructor.
     *
     * @param UserLanguageRepository $userLanguageRepository
     */
    public function __construct(UserLanguageRepository $userLanguageRepository)
    {
        parent::__construct($userLanguageRepository);
    }

    /**
     * add Language info to db
     * @param $request
     * @return bool
     */
    public function updateOrCreateLanguageInformation($request): bool
    {
        $user_id = isset($request->id) ? $request->id : null;
        $language = isset($request->language) ? $request->language : null;
        $proficiency_level = isset($request->proficiency_level) ? $request->proficiency_level : null;
        $formId = isset($request->formId) ? $request->formId : null;
        $checkLanguage = $this->modelRepository->selectLanguageByUserIdAndLanguageName($user_id, $language);

        $languageInformationFillData = [
            "user_id" => $user_id,
            "language" => $language,
            "proficiency_level" => $proficiency_level,
        ];

        if (empty($checkLanguage)) { //if already language exist for this user
            return $this->modelRepository->updateOrCreateLanguageInfo($languageInformationFillData, $formId);
        } else {
            return $this->modelRepository->updateLanguageByUserIdAndLanguageName($user_id, $language, $languageInformationFillData);
        }
    }
}
