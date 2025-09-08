{{-- This file is used for menu items by any Backpack v6 theme --}}
<li class="nav-item"><a class="nav-link" href="{{ backpack_url('dashboard') }}"><i class="la la-home nav-icon"></i> {{ trans('backpack::base.dashboard') }}</a></li>
<li class="nav-item"><a class="nav-link" href="{{ route('home', 'index') }}" target="_blank"><i class="la la-dashboard nav-icon"></i> {{ trans('admin.go-to-web') }}</a></li>

<li class="nav-title">{{trans('menu-admin.administrator')}}</li>
<li class="nav-item"><a class="nav-link" href="{{ route('webapi.sitemap-generate') }}" target="_blank"><i class="las la-sitemap nav-icon"></i> {{ trans('menu-admin.generate-sitemap') }}</a></li>
@if (backpack_user()->hasRole('Superadmin'))
<li class='nav-item'><a class='nav-link' href='{{ backpack_url('page') }}'><i class='nav-icon la la-file-o'></i> <span>{{trans('menu-admin.pages')}}</span></a></li>
@endif
@if (backpack_user()->hasRole('Superadmin'))
<li class='nav-item'><a class='nav-link' href='{{ backpack_url('menu-item') }}'><i class='nav-icon la la-list'></i> <span>{{trans('menu-admin.menu')}}</span></a></li>
@endif
{{-- <li class='nav-item'><a class='nav-link' href='{{ backpack_url('preset-email') }}'><i class='nav-icon la la-envelope'></i> {{trans('menu-admin.preset-emails')}}</a></li> --}}
@if (backpack_user()->hasRole('Superadmin'))
    <li class="nav-item"><a class="nav-link" href="{{ backpack_url('language/texts') }}"><i class="nav-icon la la-language"></i> {{trans('menu-admin.static-translates')}}</a></li>
{{--     <li class='nav-item'><a class='nav-link' href='{{ backpack_url('slide') }}'><i class='nav-icon lar la-images'></i> {{trans('menu-admin.slides')}}</a></li> --}}
    <li class="nav-item"><a class="nav-link" href="{{ backpack_url('social-network') }}"><i class="nav-icon las la-hashtag"></i> {{trans('menu-admin.social-networks')}}</a></li>
    <li class='nav-item'><a class='nav-link' href='{{ backpack_url('lead') }}'><i class='nav-icon lab la-mailchimp'></i> {{trans('menu-admin.leads')}}</a></li>
    <li class="nav-item"><a class="nav-link" href="{{ backpack_url('cookie') }}"><i class="nav-icon la la-cookie-bite"></i> {{trans('menu-admin.cookies')}}</a></li>
@endif
<li class="nav-title">{{trans('menu-admin.web')}}</li>
{{-- <li class='nav-item'><a class='nav-link' href='{{ backpack_url('multimedia') }}'><i class='nav-icon las la-photo-video'></i> {{trans('menu-admin.multimedia')}}</a></li> --}}
@if (backpack_user()->hasRole(['Superadmin', 'Blog']))
<li class="nav-item nav-dropdown">
    <a class="nav-link nav-dropdown-toggle" href="#"><i class="nav-icon la la-newspaper-o"></i>{{trans('menu-admin.news')}}</a>
    <ul class="nav-dropdown-items">
        <li class="nav-item"><a class="nav-link" href="{{ backpack_url('blog-article') }}"><i class="nav-icon la la-newspaper-o"></i> {{trans('menu-admin.articles')}}</a></li>
        <li class="nav-item"><a class="nav-link" href="{{ backpack_url('blog-category') }}"><i class="nav-icon la la-list"></i> {{trans('menu-admin.categories')}}</a></li>
        <li class="nav-item"><a class="nav-link" href="{{ backpack_url('blog-tag') }}"><i class="nav-icon la la-tag"></i> {{trans('menu-admin.tags')}}</a></li>
    </ul>
</li>
@endif

<li class="nav-title">{{trans('menu-admin.super-administrator')}}</li>
<li class="nav-item nav-dropdown">
    <a class="nav-link nav-dropdown-toggle" href="#"><i class="nav-icon las la-user-shield"></i>{{trans('menu-admin.administrator')}}</a>
    <ul class="nav-dropdown-items">
    @if (backpack_user()->hasRole('Superadmin'))
        @includeWhen(class_exists(\Backpack\DevTools\DevToolsServiceProvider::class), 'backpack.devtools::buttons.sidebar_item')
        <li class="nav-item nav-dropdown">
            <a class="nav-link nav-dropdown-toggle" href="#"><i class="nav-icon la la-globe"></i> {{trans('menu-admin.translations')}}</a>
            <ul class="nav-dropdown-items">
                <li class="nav-item"><a class="nav-link" href="{{ backpack_url('language') }}"><i class="nav-icon la la-flag-checkered"></i> {{trans('menu-admin.languages-backend')}}</a></li>
                <li class="nav-item"><a class="nav-link" href="{{ backpack_url('language/texts') }}"><i class="nav-icon la la-language"></i> {{trans('menu-admin.site-texts')}}</a></li>
            </ul>
        </li>
        <li class="nav-item nav-dropdown">
            <a class="nav-link nav-dropdown-toggle" href="#"><i class="nav-icon la la-group"></i> {{trans('menu-admin.authentication')}}</a>
            <ul class="nav-dropdown-items">
                <li class="nav-item"><a class="nav-link" href="{{ backpack_url('user') }}"><i class="nav-icon la la-user"></i> <span>{{trans('menu-admin.users')}}</span></a></li>
                <li class="nav-item"><a class="nav-link" href="{{ backpack_url('role') }}"><i class="nav-icon la la-group"></i> <span>{{trans('menu-admin.roles')}}</span></a></li>
                <li class="nav-item"><a class="nav-link" href="{{ backpack_url('permission') }}"><i class="nav-icon la la-key"></i> <span>{{trans('menu-admin.permissions')}}</span></a></li>
            </ul>
        </li>
        <li class='nav-item'><a class='nav-link' href='{{ backpack_url('log') }}'><i class='nav-icon la la-terminal'></i> {{trans('menu-admin.logs')}}</a></li>
        <li class='nav-item'><a class='nav-link' href='{{ backpack_url('setting') }}'><i class='nav-icon la la-cog'></i> <span>{{trans('menu-admin.settings')}}</span></a></li>
        <li class='nav-item'><a class='nav-link' href='{{ backpack_url('gallery') }}'><i class='nav-icon la la-image'></i> {{trans('menu-admin.galleries')}}</a></li>
        <li class='nav-item'><a class='nav-link' href='{{ backpack_url('backup') }}'><i class='nav-icon la la-hdd-o'></i> {{trans('menu-admin.backups')}}</a></li>
        <li class='nav-item'><a class='nav-link' href='{{ backpack_url('version') }}'><i class='nav-icon las la-code-branch'></i> {{trans('menu-admin.versions')}}</a></li>
    @endif
    </ul>
</li>
{{-- PARAMETRIC TABLES --}}
{{-- @if (backpack_user()->hasRole('Superadmin'))
    <li class="nav-title">{{trans('menu-admin.parametric-tables')}}</li>
    <li class="nav-item"><a class="nav-link" href="{{ backpack_url('parametric-table') }}"><i class="nav-icon la la-th-list"></i> {{trans('admin.tables')}}</a></li>
    <li class="nav-item nav-dropdown">
        <a class="nav-link nav-dropdown-toggle" href="#"><i class="nav-icon la la-th-list"></i> {{trans('admin.values')}}</a>
        <ul class="nav-dropdown-items">
            <!-- Añadir aquí las tablas paramétricas -->
        </ul>
    </li>
@endif--}}

@if (backpack_user()->hasRole('Superadmin'))
<x-backpack::menu-item :title="trans('backpack::crud.file_manager')" icon="la la-files-o" :link="backpack_url('elfinder')" />
@endif