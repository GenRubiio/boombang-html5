@extends('layouts.app')

@php
    if (isset($items)) {
        extract($items);
    }
    if (!isset($page)) {
        $page = getPageByName('Contact');
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
    <div class="container" id="page-contact">
        <div class="d-flex flex-wrap justify-content-center page-margin">
            <h1 class="text-center w-100">
                Contacto
            </h1>
        </div>
        <div class="d-flex">
            <div class="contact-form__form">
                <form action="{{ route('webapi.form-contact') }}" id="contact-form" method="post">
                    @csrf
                    <input name="url_origin" type="hidden" value="{{ url()->current() }}">
                    <input name="lang" type="hidden" value="{{ app()->getLocale() }}">

                    <div class="contact-form__form-input-block">
                        <div>
                            <label for="name">{{ trans('form.name-label') }}</label>
                            <input type="text" name="name" id="name"
                                   placeholder="{{ trans('form.name-placeholder') }}" required>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block-errors">
                        <div>
                            <span id="contact-form_error_input_name"></span>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block">
                        <div>
                            <label for="email">{{ trans('form.email-label') }}</label>
                            <input type="text" name="email" id="email"
                                   placeholder="{{ trans('form.email-placeholder') }}" required>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block-errors">
                        <div>
                            <span id="contact-form_error_input_email"></span>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block">
                        <div>
                            <label for="message">{{ trans('form.message-label') }}</label>
                            <textarea rows="5" name="message" id="message" placeholder="{{ trans('form.message-placeholder') }}" required></textarea>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block-errors">
                        <div>
                            <span id="contact-form_error_input_message"></span>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block">
                        <div>
                            <label class="contact-form__form-input-checkbox">
                                <input type="checkbox" id="accept_terms" name="accept_terms"  />
                                {{ trans('form.policy_text') }}
                                <a href="{{ makeUrl('Política de privacidad') }}" target="_blank">{{ trans('form.policy_link') }}</a>
                            </label>
                        </div>
                    </div>
                    <div class="contact-form__form-input-block-errors">
                        <div>
                            <span id="contact-form_error_input_accept_terms"></span>
                        </div>
                    </div>
                    @if (App::environment('production') || App::environment('staging'))
                        <input type="hidden" name="recaptchaResponse" id="recaptchaResponseCustomer">
                    @endif
                    <div class="contact-form__form-submit-block">
                        <button type="submit" class="btn-black btn-effect">
                            {{ trans('form.button-submit') }}
                        </button>
                    </div>
                    <div class="contact-form__form-input-block-success">
                        <div>
                            <span id="contact-form_success"></span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
