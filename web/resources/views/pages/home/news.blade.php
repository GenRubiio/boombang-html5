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

@section('content')
    <div class="container" id="page-news">
        <div class="page-news">
            @include('partials.pages.banner')
            @include('partials.pages.news.content')
        </div>
    </div>
@endsection
