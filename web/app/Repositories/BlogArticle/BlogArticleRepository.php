<?php

namespace App\Repositories\BlogArticle;

use App\Models\BlogArticle;
use App\Repositories\Repository;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class BlogArticleRepository extends Repository implements BlogArticleRepositoryInterface
{
    public function __construct()
    {
        $this->model = new BlogArticle();
        parent::__construct($this->model);
    }

    public function getIndexData()
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () {
            return $this->model->published()->datePast()->limit($this->limit)->get();
        });
    }

    public function getBlogArticle($slug)
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () use ($slug) {
            return $this->model->published()->datePast()->whereSlug($slug)->firstOrFail();
        });
    }
}
