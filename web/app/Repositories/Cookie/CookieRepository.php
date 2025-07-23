<?php

namespace App\Repositories\Cookie;

use App\Models\Cookie;
use App\Repositories\Repository;
use Illuminate\Database\Eloquent\Collection;

class CookieRepository extends Repository implements CookieRepositoryInterface
{
    public function __construct()
    {
        $this->model = new Cookie();
        parent::__construct($this->model);
    }

    public function getByCategory($category): Collection
    {
        return $this->model->active()
            ->where('category', $category)
            ->get();
    }
}
