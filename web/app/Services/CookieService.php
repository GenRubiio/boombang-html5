<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\Cookie\CookieRepository;
use Illuminate\Database\Eloquent\Collection;

class CookieService extends Controller
{
    private $cookieRepository;

    public function __construct()
    {
        $this->cookieRepository = new CookieRepository();
    }

    public function getAll(): Collection
    {
        return $this->cookieRepository->all();
    }

    public function allActives(): Collection
    {
        return $this->cookieRepository->allActives();
    }

    public function getByCategory($category): Collection
    {
        return $this->cookieRepository->getByCategory($category);
    }
}
