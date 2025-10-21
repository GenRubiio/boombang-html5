@if ($crud->hasAccess('list'))
    @php
        $weekId = $entry->getKey();
        $minigameId = isset($entry->minigame_id) ? $entry->minigame_id : ($entry->minigame->id ?? null);
    @endphp
    <a href="{{ backpack_url('minigame-score') }}?minigame_week_id={{ $weekId }}&minigame_id={{ $minigameId }}" class="btn btn-sm btn-link" title="View scores for this week">
        <i class="la la-list"></i> Scores
    </a>
@endif
