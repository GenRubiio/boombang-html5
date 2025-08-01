@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Discover');
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
    <div class="container" id="page-discover">
        <div class="page-discover">
            @include('partials.pages.banner')
            @include('partials.pages.discover.content')
        </div>
    </div>
@endsection
