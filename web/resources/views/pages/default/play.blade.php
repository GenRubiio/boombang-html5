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
    <style>
        #page-play {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background-color: #000;
        }

        #page-play iframe {
            width: 1012px;
            height: 657px;
            overflow: hidden;
            border: none;
            transform-origin: top left;
            position: absolute;
            top: 0;
            left: 0;
        }
    </style>

    <div class="container-fluid" id="page-play">
        <iframe src="{{ config('settings.client_url') }}"
            allow="identity-credentials-get" allowfullscreen></iframe>
    </div>

    <script>
        function rescalePlayIframe() {
            const baseWidth = 1012;
            const baseHeight = 657;

            const scaleX = window.innerWidth / baseWidth;
            const scaleY = window.innerHeight / baseHeight;

            // Usa el menor para que siempre quepa sin salirse, máximo 1 (tamaño original)
            const scale = Math.min(scaleX, scaleY, 1);

            const iframe = document.querySelector('#page-play iframe');
            if (iframe) {
                iframe.style.transform = `scale(${scale})`;
                console.log(`[PlayPage] Iframe scaled to: ${scale.toFixed(2)} (window: ${window.innerWidth}x${window.innerHeight})`);
            } else {
                console.warn('[PlayPage] Iframe not found');
            }
        }

        // Ejecutar al cargar
        window.addEventListener('DOMContentLoaded', function() {
            rescalePlayIframe();
            window.addEventListener('resize', rescalePlayIframe);
        });
    </script>
@endsection
