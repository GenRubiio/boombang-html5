<?php

namespace App\Repositories\BlogArticle;

interface BlogArticleRepositoryInterface
{
    public function getIndexData();
    public function getBlogArticle($slug);
}
