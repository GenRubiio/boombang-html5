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

@section('content')
    <div class="container-1440 page-margin" id="page-terms">
        <div class="d-flex flex-wrap justify-content-center page-terms">
            <h1>
                Page "Terms" created succesfully!
            </h1>
        </div>
    </div>
@endsection
