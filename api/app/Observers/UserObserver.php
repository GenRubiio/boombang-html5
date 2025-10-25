<?php

namespace App\Observers;

use App\Models\User;
use App\Enums\AvatarEnum;
use App\Models\CatalogItem;
use App\Enums\ColorChatEnum;
use App\Enums\ColorNameEnum;
use App\Enums\ColorFichaEnum;
use App\Enums\ColorShadowEnum;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Create catalog items for a given decoration type and values.
     */
    private function createCatalogItems(User $user, string $decorationType, array $decorationValues): void
    {
        foreach ($decorationValues as $value) {
            $catalogItem = CatalogItem::where('user_decoration_type', $decorationType)
                ->where('user_decoration_value', $value->key())
                ->first();

            if ($catalogItem) {
                $user->catalogItems()->create([
                    'catalog_item_id' => $catalogItem->id,
                    'show_in_inventory' => false
                ]);
            }
        }
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        try {
            $this->createCatalogItems($user, 'ficha', [ColorFichaEnum::USER, ColorFichaEnum::VIP, ColorFichaEnum::BETA]);
            $this->createCatalogItems($user, 'shadow', [ColorShadowEnum::USER, ColorShadowEnum::VIP]);
            $this->createCatalogItems($user, 'chat', [ColorChatEnum::USER, ColorChatEnum::VIP]);
            $this->createCatalogItems($user, 'name', [ColorNameEnum::USER, ColorNameEnum::VIP]);
            $this->createCatalogItems($user, 'avatar', [AvatarEnum::GATA, AvatarEnum::RASTA]);
        } catch (\Exception $e) {
            Log::error('Error creating catalog items for user: ' . $e->getMessage());
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
