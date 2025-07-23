<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\Page\PageRepository;
use Illuminate\Database\Eloquent\Collection;

class PageService extends Controller
{
    private $pageRepository;

    public function __construct()
    {
        $this->pageRepository = new PageRepository();
    }

    public function getAll(): Collection
    {
        return $this->pageRepository->allActives();
    }
}
