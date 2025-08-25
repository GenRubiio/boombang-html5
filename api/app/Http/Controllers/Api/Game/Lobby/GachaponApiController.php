<?php

namespace App\Http\Controllers\Api\Game\Lobby;

use Exception;
use App\Models\CatalogItem;
use Illuminate\Http\Request;
use App\Enums\CatalogItemTypesEnum;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class GachaponApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function spin()
    {
        try {
            $user = Auth::user();
            if ($user->silver_coins < 100) {
                throw new Exception('Not enough silver coins');
            }

            // Descuenta los 100 plata por la tirada
            $user->silver_coins -= 100;
            $user->save();

            // Probabilidades (suman 100)
            $probabilities = [
                ['type' => 'item', 'stars' => 1, 'chance' => 45],
                ['type' => 'item', 'stars' => 2, 'chance' => 22],
                ['type' => 'item', 'stars' => 3, 'chance' => 10],
                ['type' => 'item', 'stars' => 4, 'chance' => 4],
                ['type' => 'item', 'stars' => 5, 'chance' => 1],
                ['type' => 'decoration', 'stars' => 2, 'chance' => 8, 'comp' => 1],
                ['type' => 'decoration', 'stars' => 3, 'chance' => 6, 'comp' => 2],
                ['type' => 'decoration', 'stars' => 4, 'chance' => 3, 'comp' => 5],
                ['type' => 'decoration', 'stars' => 5, 'chance' => 1, 'comp' => 10],
            ];

            // Roll
            $roll = rand(1, 100);
            $cumulative = 0;
            $result = null;

            foreach ($probabilities as $p) {
                $cumulative += $p['chance'];
                if ($roll <= $cumulative) {
                    $result = $p;
                    break;
                }
            }

            if (!$result) {
                throw new Exception("No result");
            }

            // Buscar un item que coincida en DB
            $gachaponItems = CatalogItem::inLobbyGacha()
                ->where('stars', $result['stars'])
                ->get();

            if ($gachaponItems->isEmpty()) {
                throw new Exception("No items found for rarity");
            }

            $item = $gachaponItems->random();

            // Verificar si ya lo tiene
            $alreadyOwned = $user->catalogItems()->where('catalog_item_id', $item->id)->exists();

            if ($alreadyOwned && $result['type'] == CatalogItemTypesEnum::USER_DECORATION->key()) {
                // Compensación SOLO para decoraciones de personaje
                $user->gold_coins += $result['comp'];
                $user->save();
            } else {
                // Dar item al usuario
                $user->catalogItems()->create([
                    'catalog_item_id' => $item->id,
                ]);
            }
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function get(Request $request)
    {
        // Implement the get logic here
    }
}
