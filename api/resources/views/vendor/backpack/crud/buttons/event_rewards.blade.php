@if ($crud->hasAccess('list'))
    <a href="{{ backpack_url('reward') }}?event_id={{ $entry->getKey() }}" class="btn btn-sm btn-link" title="View event rewards">
        <i class="la la-gift"></i> Rewards ({{ $entry->rewards->count() }})
    </a>
@endif
