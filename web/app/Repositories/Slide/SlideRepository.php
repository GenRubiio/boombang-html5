<?php

namespace App\Repositories\Slide;

use App\Models\Slide;
use App\Repositories\Repository;
use Illuminate\Database\Eloquent\Collection;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class SlideRepository extends Repository implements SlideRepositoryInterface
{
    public function __construct()
    {
        $this->model = new Slide();
        parent::__construct($this->model);
    }

    public function getHomeSlider(): Collection
    {
        return cache()->remember('slides.getHomeSlider' . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () {
            return $this->model->active()->typeHome()->betweenDates()->ordered()->get();
        });
    }
}
