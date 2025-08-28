<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\CatalogItem;
use App\Enums\ColorChatEnum;
use App\Enums\ColorNameEnum;
use App\Enums\ColorFichaEnum;
use App\Enums\ColorShadowEnum;
use Illuminate\Console\Command;

class BootUserDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:boot-user-data-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        foreach ($users as $user) {
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
                'catalog_item_id' => CatalogItem::where('user_decoration_type', 'ficha')
                    ->where('user_decoration_value', ColorFichaEnum::VIP->key())
                    ->first()
                    ->id,
                'show_in_inventory' => false
            ]);
            $user->catalogItems()->create([
                'catalog_item_id' => CatalogItem::where('user_decoration_type', 'ficha')
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
    }
}
