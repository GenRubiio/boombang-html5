@if ($crud->hasAccess('create'))
    <a href="{{ backpack_url('user-catalog-item/create') }}?user_id={{ request('user_id') }}" class="btn btn-primary">
        <i class="la la-plus"></i> Add item
    </a>
@endif
