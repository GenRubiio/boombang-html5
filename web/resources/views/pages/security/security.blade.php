@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Security');
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
    <div class="container-1440 page-margin" id="page-security">
        <div class="d-flex flex-wrap justify-content-center page-security">
            <h1>
                Page "Security" created succesfully!
            </h1>
        </div>
    </div>
@endsection
