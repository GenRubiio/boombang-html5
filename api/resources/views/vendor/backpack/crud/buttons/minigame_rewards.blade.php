@if ($crud->hasAccess('list'))
    <a href="{{ backpack_url('reward') }}?minigame_id={{ $entry->getKey() }}" class="btn btn-sm btn-link" title="View minigame rewards">
        <i class="la la-gift"></i> Rewards ({{ $entry->rewards->count() }})
    </a>
@endif
