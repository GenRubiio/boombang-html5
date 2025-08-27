<?php

namespace App\Observers;

use App\Models\User;
use App\Models\CatalogItem;
use App\Enums\ColorChatEnum;
use App\Enums\ColorNameEnum;
use App\Enums\ColorFichaEnum;
use App\Enums\ColorShadowEnum;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        /**
         * Create catalog items for ficha decorations.
         */
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'ficha')
                ->where('user_decoration_value', ColorFichaEnum::USER->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'beta')
                ->where('user_decoration_value', ColorFichaEnum::VIP->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'beta')
                ->where('user_decoration_value', ColorFichaEnum::BETA->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);

        /**
         * Create catalog items for shadow decorations.
         */
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'shadow')
                ->where('user_decoration_value', ColorShadowEnum::USER->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'shadow')
                ->where('user_decoration_value', ColorShadowEnum::VIP->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);

        /**
         * Create catalog items for chat decorations.
         */
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'chat')
                ->where('user_decoration_value', ColorChatEnum::USER->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'chat')
                ->where('user_decoration_value', ColorChatEnum::VIP->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);

        /**
         * Create catalog items for name decorations.
         */
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'name')
                ->where('user_decoration_value', ColorNameEnum::USER->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);
        $user->catalogItems()->create([
            'catalog_item_id' => CatalogItem::where('user_decoration_type', 'name')
                ->where('user_decoration_value', ColorNameEnum::VIP->key())
                ->first()
                ->id,
            'show_in_inventory' => false
        ]);

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
