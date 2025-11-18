<?php

namespace App\Http\Controllers\Internal;

use App\Models\User;
use App\Models\CatalogItem;
use Illuminate\Http\Request;
use App\Models\CatalogCategory;
use App\Models\UserCatalogItem;
use App\Http\Controllers\Controller;
use App\Http\Resources\CatalogItemResource;
use App\Http\Resources\CatalogCategoryResource;
use Illuminate\Support\Facades\DB;

class ShopController extends Controller
{
    /**
     * Get catalog with categories and items
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCatalog(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not authenticated',
            ], 401);
        }

        // Obtener todas las categorías activas
        $categories = CatalogCategory::where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();

        // Obtener todos los items activos y comprables
        $items = CatalogItem::where('is_active', true)
            ->where('is_purchasable', true)
            ->with('category')
            ->orderBy('category_id', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'categories' => CatalogCategoryResource::collection($categories),
            'items' => CatalogItemResource::collection($items),
        ]);
    }

    /**
     * Purchase catalog item
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function purchaseItem(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not authenticated',
            ], 401);
        }

        $request->validate([
            'catalog_item_id' => 'required|integer|exists:catalog_items,id',
            'quantity' => 'integer|min:1',
        ]);

        $catalogItemId = $request->input('catalog_item_id');
        $quantity = (int) $request->input('quantity', 1);

        // Buscar el item del catálogo
        $catalogItem = CatalogItem::find($catalogItemId);

        if (!$catalogItem) {
            return response()->json([
                'success' => false,
                'error' => 'Catalog item not found',
            ], 404);
        }

        // Verificar que el item está activo y es comprable
        if (!$catalogItem->is_active || !$catalogItem->is_purchasable) {
            return response()->json([
                'success' => false,
                'error' => 'Item is not available for purchase',
            ], 400);
        }

        // Verificar si permite compra múltiple
        if (!$catalogItem->is_multi_buy && $quantity > 1) {
            return response()->json([
                'success' => false,
                'error' => 'This item does not support multiple purchases',
            ], 400);
        }

        // Calcular el precio total
        $totalPrice = $catalogItem->price * $quantity;

        // Aplicar descuento si existe
        if ($catalogItem->discount > 0) {
            $totalPrice = $totalPrice - ($totalPrice * ($catalogItem->discount / 100));
        }

        // Redondear el precio total
        $totalPrice = (int) round($totalPrice);

        DB::beginTransaction();

        try {
            // Verificar que el usuario tiene suficiente oro o plata según el tipo de precio
            if ($catalogItem->price_type === 'golden_coins') {
                // Asegurar que user->gold_coins sea entero
                $userGold = (int) $user->gold_coins;

                if ($userGold < $totalPrice) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'error' => 'Insufficient gold. You have ' . $userGold . ' but need ' . $totalPrice,
                    ], 400);
                }

                // Descontar el oro
                $user->gold_coins = $userGold - $totalPrice;
                $user->save();
            } elseif ($catalogItem->price_type === 'silver_coins') {
                // Asegurar que user->silver_coins sea entero
                $userSilver = (int) $user->silver_coins;

                if ($userSilver < $totalPrice) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'error' => 'Insufficient silver. You have ' . $userSilver . ' but need ' . $totalPrice,
                    ], 400);
                }

                // Descontar la plata
                $user->silver_coins = $userSilver - $totalPrice;
                $user->save();
            }

            for ($i = 0; $i < $quantity; $i++) {
                UserCatalogItem::create([
                    'user_id' => $user->id,
                    'catalog_item_id' => $catalogItem->id,
                    'show_in_inventory' => $catalogItem->show_in_inventory ?? true,
                ]);
            }

            DB::commit();

            // Refrescar el usuario para obtener los valores actualizados
            $user->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Item purchased successfully',
                'user' => [
                    'gold' => $user->gold_coins,
                    'silver' => $user->silver_coins,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Failed to purchase item: ' . $e->getMessage(),
            ], 500);
        }
    }
}
