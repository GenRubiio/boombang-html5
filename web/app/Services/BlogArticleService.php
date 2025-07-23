<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\BlogArticle\BlogArticleRepository;

class BlogArticleService extends Controller
{
    private $blogArticleRepository;

    /**
     * BlogArticleService constructor.
     */
    public function __construct()
    {
        $this->blogArticleRepository = new BlogArticleRepository();
    }

    public function index()
    {
        return $this->blogArticleRepository->getIndexData();
    }

    public function show($sonPageSlug)
    {
        return $this->blogArticleRepository->getBlogArticle($sonPageSlug);
    }
}
