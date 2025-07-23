@extends('layouts.commands')

@section('title')
    Sitemap generate
@endsection

@section('message')
    <h3>Sitemap generate successfully</h3>
    <a href="{{ makeUrl() }}">Return to home page</a>
@endsection