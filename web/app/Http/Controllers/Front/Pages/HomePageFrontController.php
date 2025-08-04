<?php

namespace App\Http\Controllers\Front\Pages;

use App\Models\BlogArticle;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogArticle\BlogArticleResource;

class HomePageFrontController extends Controller
{
    public function index(): array
    {
        $featuredBlogArticle = BlogArticle::published()
            ->latest()
            ->where('featured', true)
            ->first()
            ?->load('blogTags', 'blogCategory');
        $blogArticles = BlogArticle::published()
            ->latest()
            ->with('blogTags', 'blogCategory')
            //->whereNot('id', $featuredBlogArticle ? $featuredBlogArticle->id : null)
            ->take(6)
            ->get();
        return [
            'blog_featured' => $featuredBlogArticle ? (new BlogArticleResource($featuredBlogArticle))->toDTO() : null,
            'blog_posts' => BlogArticleResource::collectionToDTO($blogArticles),
        ];
    }
}