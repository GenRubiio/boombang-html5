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
    <div class="container-1440 page-margin" id="page-discover">
        <div class="d-flex flex-wrap justify-content-center page-discover">
            <h1>
                Page "Discover" created succesfully!
            </h1>
        </div>
    </div>
@endsection
