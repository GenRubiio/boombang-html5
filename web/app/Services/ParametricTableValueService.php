<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\ParametricTableValue\ParametricTableValueRepository;

class ParametricTableValueService extends Controller
{
    private $parametricTableValueRepository;

    /**
     * ParametricTableValueService constructor.
     */
    public function __construct()
    {
        $this->parametricTableValueRepository = new ParametricTableValueRepository();
    }
}
