<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserAvatarPalette;

/**
 * Plain service, inline validation, shaped like NpcCatalogItemService — no Repositories/
 * layer, no FormRequest (reserved for Backpack CRUD here).
 */
class UserAvatarPaletteService
{
    /**
     * Merges the submitted slots into the existing persisted palette for (user, avatarId),
     * scoped per PAL4's unique(user_id, avatar_id).
     */
    public function changePalette(User $user, int $avatarId, array $slots): array
    {
        $record = UserAvatarPalette::firstOrNew([
            'user_id' => $user->id,
            'avatar_id' => $avatarId,
        ]);

        $existing = $record->exists ? $record->palette : [];
        $merged = array_merge($existing, $slots);

        $record->palette = $merged;
        $record->save();

        return $merged;
    }

    /**
     * Retrieves the persisted palette for (user, avatarId), or an empty array when none has
     * been saved yet (PAL5: the client resolves manifest defaults for anything missing here).
     */
    public function getPalette(User $user, int $avatarId): array
    {
        $record = UserAvatarPalette::where('user_id', $user->id)
            ->where('avatar_id', $avatarId)
            ->first();

        return $record ? $record->palette : [];
    }
}
