<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\AvatarEnum;
use App\Models\CatalogItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class ImportAvatarsSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        $users = User::all();
        foreach ($users as $user) {
            try {
                $user->catalogItems()->create([
                    'catalog_item_id' => CatalogItem::where('user_decoration_type', 'avatar')
                        ->where('user_decoration_value', AvatarEnum::RASTA->key())
                        ->first()
                        ->id,
                    'show_in_inventory' => false
                ]);
                $user->catalogItems()->create([
                    'catalog_item_id' => CatalogItem::where('user_decoration_type', 'avatar')
                        ->where('user_decoration_value', AvatarEnum::GATA->key())
                        ->first()
                        ->id,
                    'show_in_inventory' => false
                ]);
            } catch (\Exception $e) {
                Log::error('Error creating catalog items for user: ' . $e->getMessage());
            }
        }
    }
}
