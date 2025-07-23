<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\Slide\SlideRepository;
use Illuminate\Database\Eloquent\Collection;

class SlideService extends Controller
{
    private $slideRepository;

    public function __construct()
    {
        $this->slideRepository = new SlideRepository();
    }

    public function getHomeSlider(): Collection
    {
        return $this->slideRepository->getHomeSlider();
    }
}
