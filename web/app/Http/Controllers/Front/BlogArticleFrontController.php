<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogArticle\BlogArticleResource;
use App\Services\BlogArticleService;

class BlogArticleFrontController extends Controller
{
    public function index(): array
    {
        $blogArticles = (new BlogArticleService())->index()->load(['blogCategory', 'blogTags']);
        $blogTags = $blogArticles->pluck('blogTags')->flatten()->unique('id')->values();
        return [
            'blogArticles' => BlogArticleResource::collectionToDTO($blogArticles),
            'blogTags' => $blogTags
        ];
    }

    public function show($slug)
    {
        $blogArticle = (new BlogArticleService())->show($slug)->load([
            'blogCategory',
            'blogTags'
        ]);
        return (new BlogArticleResource($blogArticle))->toDTO();
    }

    public function showItems(): array
    {
        return [];
    }
}
