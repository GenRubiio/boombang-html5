<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\Language\LanguageRepository;

class LanguageService extends Controller
{
    private $languageRepository;

    /**
     * LanguageService constructor.
     */
    public function __construct()
    {
        $this->languageRepository = new LanguageRepository();
    }

    public function updateAll(array $data)
    {
        $this->languageRepository->updateAll($data);
    }
}
