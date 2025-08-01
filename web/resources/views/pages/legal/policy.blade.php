@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Policy');
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
    <div class="container-1440 page-margin" id="page-policy">
        <div class="d-flex flex-wrap justify-content-center page-policy">
            <h1>
                Page "Policy" created succesfully!
            </h1>
        </div>
    </div>
@endsection
