<?php

namespace App\Http\Controllers\Internal;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserCatalogItemsResource;

class InventoryController extends Controller
{
    /**
     * Get authenticated user's inventory items (for public scene read-only display)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserInventory(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not authenticated',
            ], 401);
        }

        // Obtener todos los items del inventario del usuario que tienen show_in_inventory = 1
        // y que NO están colocados en una escena privada (private_scene_id = null)
        $inventoryItems = $user->catalogShowItems()
            ->whereNull('private_scene_id')
            ->with(['catalogItem'])
            ->get();

        return response()->json([
            'success' => true,
            'inventory' => UserCatalogItemsResource::collection($inventoryItems),
        ]);
    }
}
