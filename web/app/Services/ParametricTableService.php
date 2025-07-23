<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\ParametricTable\ParametricTableRepository;

class ParametricTableService extends Controller
{
    private $parametricTableRepository;

    /**
     * ParametricTableService constructor.
     */
    public function __construct()
    {
        $this->parametricTableRepository = new ParametricTableRepository();
    }

    public function getAll()
    {
        return $this->parametricTableRepository->getAll();
    }

    public function getForResource()
    {
        return $this->parametricTableRepository->getForResource();
    }
}
