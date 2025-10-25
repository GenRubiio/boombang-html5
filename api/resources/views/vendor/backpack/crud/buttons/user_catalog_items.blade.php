@if ($crud->hasAccess('list'))
    <a href="{{ backpack_url('user-catalog-item') }}?user_id={{ $entry->getKey() }}" class="btn btn-sm btn-link" title="View user catalog items">
        <i class="la la-box"></i> Items ({{ $entry->userCatalogItems->count() }})
    </a>
@endif
