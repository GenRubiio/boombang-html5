<?php

namespace Database\Seeders;

use App\Models\CatalogItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * god apply pass (2026-08-19): god's catalog row, same treatment as
 * SallyAvatarCatalogItemSeeder.php. Fallback route (no live Backpack admin session in this
 * environment) — idempotent (checks `user_decoration_value` before creating), matching the
 * real production row shape (`name`, `sprite_name`, `user_decoration_type='avatar'`,
 * `user_decoration_value`).
 *
 * Live-caught running this seeder for real (2026-08-19, PHP available via
 * `docker compose exec api` — the sally seeder's own PHP was NEVER actually executed before
 * this, per its own disclosed "PHP not installed" blocker): `CatalogItem::create()` cannot be
 * used as-written for either character. Two real defects, in order:
 *   1. `HasTranslations` wraps a PLAIN string for the current locale (matching rasta's own real
 *      row, `name` = `{"en":"Avatar Rasta"}`) — passing `['en' => 'Avatar God']` double-wraps it
 *      into `{"en":{"en":"Avatar God"}}` instead.
 *   2. `CatalogItem::setSpreadsheetAttribute()` (`app/Models/CatalogItem.php`) has no branch for
 *      a plain non-file string: `$value == null` (PHP loose comparison, true for `''` too)
 *      tries `Storage::delete($this->spreadsheet)` on a brand-new model — `$this->spreadsheet`
 *      is null, and Flysystem's `delete(string $location)` rejects a null argument outright
 *      (`TypeError`). A non-empty, non-null string skips that branch but then fails the
 *      `is_file($value)` check too (an ordinary string is never a real filesystem path to an
 *      uploaded file), so the mutator NEVER assigns `$this->attributes['spreadsheet']` at all —
 *      back to the original "doesn't have a default value" failure, just one call deeper.
 *      `spreadsheet` (`database/migrations/2025_08_23_093120_add_fields_1_to_catalog_items_table.php`)
 *      is `text` NOT NULL with no default and no mutator path that accepts a plain placeholder.
 * `DB::table()->insert()` bypasses both Eloquent mutators and `HasTranslations` entirely,
 * writing the exact column values a raw INSERT would (the same shape `boombang_api.sql`'s own
 * real rows have) — the correct fix for a seeder that has no real uploaded asset to hand the
 * mutator anyway. `SallyAvatarCatalogItemSeeder.php` carries the identical fix, disclosed there
 * too.
 */
class GodAvatarCatalogItemSeeder extends Seeder
{
    public function run(): void
    {
        $existing = DB::table('catalog_items')
            ->where('user_decoration_type', 'avatar')
            ->where('user_decoration_value', '19')
            ->first();

        if ($existing) {
            return;
        }

        // Reuse an existing avatar row's category, if one is already seeded, so god lands in
        // the same catalog category as every other avatar rather than an unset one.
        $referenceAvatarRow = DB::table('catalog_items')->where('user_decoration_type', 'avatar')->first();

        DB::table('catalog_items')->insert([
            'category_id' => $referenceAvatarRow?->category_id,
            'name' => json_encode(['en' => 'Avatar God']),
            'sprite_name' => 'avatar_god',
            'image' => null,
            // No real uploaded asset exists for this character (unlike rasta's real row, which
            // points at a real uploaded SVG/PNG) — `''` is honest about that rather than a
            // fabricated path, and the column itself disallows NULL.
            'spreadsheet' => '',
            'description' => json_encode(['en' => 'Avatar God']),
            'price' => 0,
            'type' => 'user_decoration',
            'price_type' => 'golden_coins',
            'discount' => 0,
            'user_decoration_type' => 'avatar',
            'user_decoration_value' => '19',
            'is_purchasable' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
