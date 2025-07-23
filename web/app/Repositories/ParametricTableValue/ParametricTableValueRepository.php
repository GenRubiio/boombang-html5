<?php

namespace App\Repositories\ParametricTableValue;

use App\Models\ParametricTableValue;
use App\Repositories\Repository;

class ParametricTableValueRepository extends Repository implements ParametricTableValueRepositoryInterface
{
    public function __construct()
    {
        $this->model = new ParametricTableValue();
        parent::__construct($this->model);
    }
}
