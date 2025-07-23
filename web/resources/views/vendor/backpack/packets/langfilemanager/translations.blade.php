@extends(backpack_view('layouts.top_left'))

@php
    $defaultBreadcrumbs = [
        trans('backpack::crud.admin') => backpack_url('dashboard'),
        $crud->entity_name_plural => url($crud->route),
        trans('backpack::crud.edit') . ' ' . trans('backpack::langfilemanager.texts') => false,
    ];

    // if breadcrumbs aren't defined in the CrudController, use the default breadcrumbs
    $breadcrumbs = $breadcrumbs ?? $defaultBreadcrumbs;
@endphp

@section('header')
    <section class="container-fluid">
        <h2>
            <span class="text-capitalize">{{ trans('backpack::langfilemanager.translate') }}</span>
            <small>{{ trans('backpack::langfilemanager.site_texts') }}.</small>

            @if ($crud->hasAccess('list'))
                <small><a href="{{ url($crud->route) }}" class="hidden-print font-sm"><i class="fa fa-angle-double-left"></i>
                        {{ trans('backpack::crud.back_to_all') }} <span>{{ $crud->entity_name_plural }}</span></a></small>
            @endif
        </h2>

    </section>
@endsection

@section('content')
    @include('vendor.backpack.packets.langfilemanager.modals.new-file')
    @include('vendor.backpack.packets.langfilemanager.modals.new-translation')
    @include('vendor.backpack.packets.langfilemanager.modals.validate-translations')
    @include('vendor.backpack.packets.langfilemanager.modals.commit-translates')
    <!-- Default box -->
    <div class="box">
        <div class="box-header with-border">
            <h3 class="box-title float-right pr-1">
                <small>
                    &nbsp; {{ trans('backpack::langfilemanager.switch_to') }}: &nbsp;
                    <select name="language_switch" id="language_switch">
                        @foreach ($languages as $lang)
                            <option
                                value="{{ url(config('backpack.base.route_prefix', 'admin') . "/language/texts/{$lang->abbr}") }}"
                                {{ $currentLang == $lang->abbr ? 'selected' : '' }}>{{ $lang->name }}</option>
                        @endforeach
                    </select>
                </small>
            </h3>
        </div>
        <div class="box-body">
            <ul class="nav nav-tabs">
                @foreach ($langFiles as $file)
                    <li class="nav-item">
                        <a class="nav-link {{ $file['active'] ? 'active' : '' }}"
                            href="{{ $file['url'] }}">{{ $file['name'] }}</a>
                    </li>
                @endforeach
            </ul>
            <section class="tab-content p-3 lang-inputs">
                @if (!empty($fileArray))
                    <form method="post" id="lang-form" class="form-horizontal"
                        data-required="{{ trans('admin.language.fields_required') }}"
                        action="{{ url(config('backpack.base.route_prefix', 'admin') . "/language/texts/{$currentLang}/{$currentFile}") }}">
                        {!! csrf_field() !!}
                        <div class="form-group row">
                            <div class="col-sm-2">
                                <h5>{{ trans('backpack::langfilemanager.key') }}</h5>
                            </div>
                            <div class="hidden-sm hidden-xs col-md-5">
                                <h5>{{ trans('backpack::langfilemanager.language_text', ['language_name' => $browsingLangObj->name]) }}
                                </h5>
                            </div>
                            <div class="col-sm-10 col-md-5">
                                <h5>{{ trans('backpack::langfilemanager.language_translation', ['language_name' => $currentLangObj->name]) }}
                                </h5>
                            </div>
                        </div>
                        {!! $langfile->displayInputs($fileArray) !!}
                        <hr>
                        <div class="text-center">
                            <button type="submit"
                                class="btn btn-success submit">{{ trans('backpack::crud.save') }}</button>
                        </div>
                    </form>
                @else
                    <em>{{ trans('backpack::langfilemanager.empty_file') }}</em>
                @endif
            </section>
        </div><!-- /.card-body -->
        <p><small>{!! trans('backpack::langfilemanager.rules_text') !!}</small></p>
    </div><!-- /.card -->
@endsection

@section('after_scripts')
    <script>
        jQuery(document).ready(function($) {
            let creatTransButton = $('#create-new-translation-button');
            let pathname = window.location.pathname;
            if (pathname == '/admin/language/texts') {
                creatTransButton.attr("disabled", true);
            } else {
                creatTransButton.attr("disabled", false);
                let prefixTransFileDiv = $("#translation_key_file");
                let prefixTransFileInput = $("#translation_key_file_input");
                let fileName = pathname.split("/").pop();
                prefixTransFileDiv.text(fileName + ".");
                prefixTransFileInput.val(fileName);
            }
            $("#language_switch").change(function() {
                window.location.href = $(this).val();
            });
            $(document).on('submit', '#form-create-file', function(ev) {
                ev.preventDefault();
                let form = $(this);
                let alertSmall = $('#form-create-file_name-error');
                let submitButton = $('#form-create-file_submit');
                alertSmall.addClass('d-none');
                submitButton.attr("disabled", true);
                $.ajax({
                    url: form.data('url'),
                    method: "POST",
                    data: form.serialize(),
                    success: function(data) {
                        if (data.error) {
                            alertSmall.text(data.error);
                            alertSmall.removeClass('d-none');
                            submitButton.attr("disabled", false);
                        } else {
                            location.reload();
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
                form[0].reset();
            });
            $(document).on('submit', '#form-create-translation', function(ev) {
                ev.preventDefault();
                let form = $(this);
                let alertSmall = $('#form-create-translation_name-error');
                let submitButton = $('#form-create-translation_submit');
                alertSmall.addClass('d-none');
                submitButton.attr("disabled", true);
                $.ajax({
                    url: form.data('url'),
                    method: "POST",
                    data: form.serialize(),
                    success: function(data) {
                        if (data.error) {
                            alertSmall.text(data.error);
                            alertSmall.removeClass('d-none');
                            submitButton.attr("disabled", false);
                        } else {
                            location.reload();
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
                form[0].reset();
            });
            $(document).on('submit', '#form-validate-translations', function(ev) {
                ev.preventDefault();
                let form = $(this);
                let alertSmall = $('#form-validate-translations_name-error');
                let submitButton = $('#form-validate-translations_submit');
                alertSmall.addClass('d-none');
                submitButton.attr("disabled", true);
                $.ajax({
                    url: form.data('url'),
                    method: "POST",
                    data: form.serialize(),
                    success: function(data) {
                        if (data.error) {
                            alertSmall.text(data.error);
                            alertSmall.removeClass('d-none');
                            submitButton.attr("disabled", false);
                        } else {
                            location.reload();
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
                form[0].reset();
            });
        });
    </script>
@endsection
