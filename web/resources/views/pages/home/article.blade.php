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
@include('partials.page-metas-seos', [
    'object' => $article->seo ?? [],
])

@section('content')
    <div class="container-fluid" id="page-article">
        <div class="page-article">
            @include('partials.pages.banner', [
                'header_image' => $pageResource->content->content_header_image ?? null,
                'button_image' => $pageResource->content->content_button_image ?? null,
            ])
            @include('partials.pages.news.article.content')
        </div>
    </div>
@endsection
