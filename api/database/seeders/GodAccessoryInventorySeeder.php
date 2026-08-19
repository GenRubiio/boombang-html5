<?php

namespace Database\Seeders;

use App\Models\CatalogItem;
use App\Models\User;
use App\Models\UserCatalogItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * avatar-system-multichar-fixes follow-up (local dev convenience, `God` account only): grants
 * ownership of every hat/pet/aura accessory that has a real compiled package under
 * client/src/assets/game/accessories/, so the game's own accessory-equip flow (not just the
 * debug panel) can select and render anything that actually exists. This does not touch
 * purchase/pricing logic and must never be extended to grant every user everything.
 *
 * Ownership in this schema is GLOBAL, not per-character: `catalog_items.user_decoration_value`
 * stores a single key (e.g. "minnieHat") shared by all 15 avatars — see
 * User::enabledHats()/enabledPets()/enabledAuras() in api/app/Models/User.php, none of which
 * filter by avatar/character. Per-character resolution happens only on the client, in
 * AccessoryManager::hasPackage(character, kind, key), once a key is equipped against whichever
 * avatar is currently active.
 *
 * The key lists below are the full compiled catalogue verified on 2026-08-19: 26 hat keys and
 * 10 pet keys, each present under all 15 character directories (26 + 10 = 36 keys x 15
 * characters = 540 compiled accessory packages), plus 1 aura key. `aura_azul` and `aura_dorada`
 * are deliberately NOT included — both exceeded the compiler's 4096px atlas limit and were
 * deferred, so granting them would offer accessories that cannot render. Regenerate these
 * lists (any character works for hat/pet — all 15 share the identical key set) with:
 *   ls client/src/assets/game/accessories/hat/marsu
 *   ls client/src/assets/game/accessories/pet/marsu
 *   ls client/src/assets/game/accessories/aura
 *
 * Idempotent: skips any catalog_items row that already exists for a given
 * (user_decoration_type, user_decoration_value) pair, and any user_catalog_items link that
 * already exists for God + that catalog item. Safe to re-run.
 */
class GodAccessoryInventorySeeder extends Seeder
{
    private const HAT_KEYS = [
        'BlueTeam', 'Custom10Hat', 'Custom1Hat', 'Custom2Hat', 'Custom3Hat', 'Custom4Hat',
        'Custom5Hat', 'Custom6Hat', 'Custom7Hat', 'Custom8Hat', 'Custom9Hat', 'RedTeam',
        'bullHat', 'cacaHat', 'flag01', 'frogHat', 'infernoHat', 'mickeyHat', 'minnieHat',
        'pandaHat', 'pineappleHat', 'pumpkinHat', 'rabbitHat', 'strawberryHat', 'xmasGreenHat',
        'xmasRedHat',
    ];

    private const PET_KEYS = [
        'pet01', 'pet02', 'pet03', 'pet04', 'pet05', 'pet06', 'pet07', 'pet08', 'pet09', 'pet10',
    ];

    private const AURA_KEYS = [
        'auraElectrica',
    ];

    public function run(): void
    {
        $god = User::where('username', 'God')->first();

        if (!$god) {
            $this->command?->warn('GodAccessoryInventorySeeder: no user with username "God" found, skipping.');
            return;
        }

        foreach (self::HAT_KEYS as $key) {
            $this->grant($god, 'avatar_hat', $key, 'Hat');
        }

        foreach (self::PET_KEYS as $key) {
            $this->grant($god, 'avatar_pet', $key, 'Pet');
        }

        foreach (self::AURA_KEYS as $key) {
            $this->grant($god, 'avatar_aura', $key, 'Aura');
        }
    }

    private function grant(User $user, string $decorationType, string $key, string $label): void
    {
        $catalogItem = CatalogItem::where('user_decoration_type', $decorationType)
            ->where('user_decoration_value', $key)
            ->first();

        if (!$catalogItem) {
            // Raw DB::table insert, not CatalogItem::create(): the model's Spatie
            // HasTranslations trait double-encodes an array passed straight through mass
            // assignment (observed while authoring this seeder — `name` ended up stored as
            // `{"en":{"en":"..."}}`), and `spreadsheet` has no column default despite being
            // NOT NULL, matching the empty-string convention already on catalog_items row 189.
            $now = now();
            $catalogItemId = DB::table('catalog_items')->insertGetId([
                'name' => json_encode(['en' => "{$label} {$key}"]),
                'sprite_name' => $key,
                'spreadsheet' => '',
                'type' => 'decoration',
                'price' => 1000,
                'price_type' => 'golden_coins',
                'user_decoration_type' => $decorationType,
                'user_decoration_value' => $key,
                'is_purchasable' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $catalogItem = CatalogItem::find($catalogItemId);
        }

        $existingLink = UserCatalogItem::where('user_id', $user->id)
            ->where('catalog_item_id', $catalogItem->id)
            ->whereNull('private_scene_id')
            ->first();

        if (!$existingLink) {
            UserCatalogItem::create([
                'user_id' => $user->id,
                'catalog_item_id' => $catalogItem->id,
                'private_scene_id' => null,
                'occupied_tiles' => '[]',
            ]);
        }
    }
}
