@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Terms');
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
    <div class="container" id="page-terms">
        <div class="page-terms">
            @include('partials.pages.banner', [
                'header_image' => $pageResource->content->content_header_image ?? null,
                'button_image' => $pageResource->content->content_button_image ?? null,
            ])
            @include('partials.pages.terms.content', [
                'title' => $pageResource->content->content_title ?? $page->title,
                'content' => $pageResource->content->content_content ?? null,
            ])
        </div>
    </div>
@endsection
