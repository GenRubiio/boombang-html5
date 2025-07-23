<?php

namespace App\Repositories\Page;

use App\Models\Page;
use App\Repositories\Repository;

class PageRepository extends Repository implements PageRepositoryInterface
{
    public function __construct()
    {
        $this->model = new Page();
        parent::__construct($this->model);
    }
}
