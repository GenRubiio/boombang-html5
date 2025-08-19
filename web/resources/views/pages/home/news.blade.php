@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('News');
    }
    if (!isset($pageResource)) {
        $pageResource = getResourcePage($page);
    }
@endphp

{{-- Meta injections --}}
@include('partials.page-metas', [
    'object' => $pageResource->metas ?? $page,
])

@push('schemas')
    {!! $pageResource->schema !!}
@endpush

@section('content')
    <div class="container" id="page-news">
        <div class="page-news">
            @include('partials.pages.banner', [
                'header_image' => $pageResource->content->content_header_image ?? null,
                'button_image' => $pageResource->content->content_button_image ?? null,
            ])
            @include('partials.pages.news.content', [
                'title' => $pageResource->content->content_title ?? null,
                'blog_articles' => $blogArticles ?? [],
                'blog_tags' => $blogTags ?? [],
            ])
        </div>
    </div>
@endsection
