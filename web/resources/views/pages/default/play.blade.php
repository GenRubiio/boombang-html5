@extends('layouts.play')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Play');
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
    <div class="container-fluid" id="page-play">
        <iframe src="{{ config('settings.client_url') }}" frameborder="0" width="100%" height="100%"
            allowfullscreen></iframe>
    </div>
@endsection
