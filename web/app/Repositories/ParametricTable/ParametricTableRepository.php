<?php

namespace App\Repositories\ParametricTable;

use App\Models\ParametricTable;
use App\Repositories\Repository;

class ParametricTableRepository extends Repository implements ParametricTableRepositoryInterface
{
    public function __construct()
    {
        $this->model = new ParametricTable();
        parent::__construct($this->model);
    }

    public function getAll()
    {
        return $this->model->all();
    }

    public function getForResource()
    {
        return $this->model->where('resource', true)->get();
    }
}
