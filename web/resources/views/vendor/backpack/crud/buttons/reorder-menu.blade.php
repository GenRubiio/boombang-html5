<span class="dropdown">
    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true"
        aria-expanded="false">
        <i class="la la-arrows"></i> {{ trans('backpack::crud.reorder') }}
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a href="{{ url($crud->route . '/reorder-menu-top') }}" class="dropdown-item" data-style="zoom-in">
            <span class="ladda-label">
                <i class="la la-arrows"></i> {{ trans('backpack::crud.reorder') }} {{ trans('admin.menu_top') }}
            </span>
        </a>
        <a href="{{ url($crud->route . '/reorder-menu-footer') }}" class="dropdown-item" data-style="zoom-in">
            <span class="ladda-label">
                <i class="la la-arrows"></i> {{ trans('backpack::crud.reorder') }} {{ trans('admin.menu_footer') }}
            </span>
        </a>
        <a href="{{ url($crud->route . '/reorder-menu-legal') }}" class="dropdown-item" data-style="zoom-in">
            <span class="ladda-label">
                <i class="la la-arrows"></i> {{ trans('backpack::crud.reorder') }} {{ trans('admin.menu_legal') }}
            </span>
        </a>
    </div>
</span>
