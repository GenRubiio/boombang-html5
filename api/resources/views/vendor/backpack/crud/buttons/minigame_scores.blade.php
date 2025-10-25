@if ($crud->hasAccess('list'))
    <a href="{{ backpack_url('minigame-week') }}?minigame_id={{ $entry->getKey() }}" class="btn btn-sm btn-link" title="View minigame weeks">
        <i class="la la-list"></i>
        @php
            $weeksCount = 0;
            if (isset($entry->weeks) && is_callable([$entry->weeks, 'count'])) {
                $weeksCount = $entry->weeks->count();
            }
        @endphp
        Weeks ({{ $weeksCount }})
    </a>
@endif
