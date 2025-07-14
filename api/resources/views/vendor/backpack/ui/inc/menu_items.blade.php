{{-- This file is used for menu items by any Backpack v6 theme --}}
<li class="nav-item"><a class="nav-link" href="{{ backpack_url('dashboard') }}"><i class="la la-home nav-icon"></i> {{ trans('backpack::base.dashboard') }}</a></li>

<x-backpack::menu-item title="Public scenes" icon="la la-question" :link="backpack_url('public-scene')" />
<x-backpack::menu-dropdown title="Add-ons" icon="la la-puzzle-piece">
    <x-backpack::menu-dropdown-header title="Authentication" />
    <x-backpack::menu-dropdown-item title="Users" icon="la la-user" :link="backpack_url('user')" />
    <x-backpack::menu-dropdown-item title="Roles" icon="la la-group" :link="backpack_url('role')" />
    <x-backpack::menu-dropdown-item title="Permissions" icon="la la-key" :link="backpack_url('permission')" />
</x-backpack::menu-dropdown>
<x-backpack::menu-item title="Minigame scenes" icon="la la-question" :link="backpack_url('minigame-scene')" />
<x-backpack::menu-item title="Scene items" icon="la la-question" :link="backpack_url('scene-item')" />
<x-backpack::menu-item title="Islands" icon="la la-question" :link="backpack_url('island')" />
<x-backpack::menu-item title="Private scene configs" icon="la la-question" :link="backpack_url('private-scene-config')" />
<x-backpack::menu-item title="Private scenes" icon="la la-question" :link="backpack_url('private-scene')" />
<x-backpack::menu-item title="Catalog categories" icon="la la-question" :link="backpack_url('catalog-category')" />
<x-backpack::menu-item title="Catalog items" icon="la la-question" :link="backpack_url('catalog-item')" />
<x-backpack::menu-item title="User catalog items" icon="la la-question" :link="backpack_url('user-catalog-item')" />