<?php

namespace Database\Seeders;

use App\Models\CatalogItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * avatar-system-multichar-fixes slice 10 (design.md §15): sally's catalog row. Design's
 * primary route was a Backpack admin entry (data only, `user_decoration_type='avatar'`); this
 * seeder is the documented FALLBACK, used here because this apply pass has no live Backpack
 * admin session to create the row through — the seeder route design.md itself names as the
 * fallback "if admin entry proves impractical".
 *
 * Idempotent (checks `user_decoration_value` before creating, matching the real, unique
 * `sprite_name` convention observed in production data — e.g. rasta's own row: `name`
 * `{"en":"Avatar Rasta"}`, `sprite_name` `avatar_rasta`, `user_decoration_type` `avatar`,
 * `user_decoration_value` `"12"`). `image` is left null: sally's asset compile landed later
 * (tasks.md slice 22) than this row's own creation, and no real uploaded admin asset exists for
 * her either way — a placeholder path here would misrepresent unfinished work as shipped.
 *
 * Live-caught (god apply pass, 2026-08-19 — the first time PHP was actually available in this
 * environment to run this file at all; its own disclosed blocker at slice 10 time was "PHP not
 * installed"): `CatalogItem::create()` as originally written here fails outright, for two
 * reasons that also surfaced building `GodAvatarCatalogItemSeeder.php` (see that file's own,
 * fuller docblock for the exact errors reproduced): `HasTranslations` double-wraps a
 * `['en' => ...]` array instead of accepting it directly (a plain string is what gets
 * single-wrapped), and `CatalogItem::setSpreadsheetAttribute()` has no code path that accepts a
 * plain placeholder string for a NOT-NULL, no-default column — it either throws (empty/null,
 * PHP's loose `== null`) or silently drops the assignment (any other plain string, since
 * `is_file()` checks a real filesystem path, not "is this a string"). `DB::table()->insert()`
 * bypasses both, writing the exact column values a raw INSERT (the same shape
 * `boombang_api.sql`'s own real rows have) would.
 */
class SallyAvatarCatalogItemSeeder extends Seeder
{
    public function run(): void
    {
        $existing = DB::table('catalog_items')
            ->where('user_decoration_type', 'avatar')
            ->where('user_decoration_value', '18')
            ->first();

        if ($existing) {
            return;
        }

        // Reuse an existing avatar row's category, if one is already seeded, so sally lands
        // in the same catalog category as every other avatar rather than an unset one.
        $referenceAvatarRow = DB::table('catalog_items')->where('user_decoration_type', 'avatar')->first();

        DB::table('catalog_items')->insert([
            'category_id' => $referenceAvatarRow?->category_id,
            'name' => json_encode(['en' => 'Avatar Sally']),
            'sprite_name' => 'avatar_sally',
            'image' => null,
            'spreadsheet' => '',
            'description' => json_encode(['en' => 'Avatar Sally']),
            'price' => 0,
            'type' => 'user_decoration',
            'price_type' => 'golden_coins',
            'discount' => 0,
            'user_decoration_type' => 'avatar',
            'user_decoration_value' => '18',
            'is_purchasable' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
