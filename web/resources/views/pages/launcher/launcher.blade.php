@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Launcher');
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
    <div class="container-1440 page-margin" id="page-launcher">
        <div class="d-flex flex-wrap justify-content-center page-launcher">
            <h1>
                Page "Launcher" created succesfully!
            </h1>
        </div>
    </div>
@endsection
