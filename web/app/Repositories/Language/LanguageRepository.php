<?php

namespace App\Repositories\Language;

use App\Models\Language;
use App\Repositories\Repository;

/**
 * Class LanguageRepository
 * @package App\Repositories\Language
 */
class LanguageRepository extends Repository implements LanguageRepositoryInterface
{
    /**
     * LanguageRepository constructor.
     */
    public function __construct()
    {
        $this->model = new Language();
        parent::__construct($this->model);
    }

    public function updateAll($data)
    {
        $this->model->query()->update($data);
    }
}
