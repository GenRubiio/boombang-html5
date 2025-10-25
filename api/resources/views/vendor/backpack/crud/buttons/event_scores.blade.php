@if ($crud->hasAccess('list'))
    <a href="{{ backpack_url('event-score') }}?event_id={{ $entry->getKey() }}" class="btn btn-sm btn-link" title="View event scores">
        <i class="la la-list"></i> Scores ({{ $entry->scores->count() }})
    </a>
@endif
