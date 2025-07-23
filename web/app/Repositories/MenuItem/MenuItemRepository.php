<?php

namespace App\Repositories\MenuItem;

use App\Models\MenuItem;
use App\Repositories\Repository;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class MenuItemRepository extends Repository implements MenuItemRepositoryInterface
{
    public function __construct()
    {
        $this->model = new MenuItem();
        parent::__construct($this->model);
    }

    public function getMenuTop()
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () {
            return $this->model->whereNull('parent_id')->menuTop()->with('children')->ordered()->active()->get();
        });
    }

    public function getMenuFooter()
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () {
            return $this->model->whereNull('parent_id')->menuFooter()->with('children')->ordered()->active()->get();
        });
    }

    public function getMenuLegal()
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () {
            return $this->model->whereNull('parent_id')->menuLegal()->with('children')->ordered()->active()->get();
        });
    }
}
