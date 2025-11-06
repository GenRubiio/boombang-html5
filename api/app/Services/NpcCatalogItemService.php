<?php

namespace App\Services;

use App\Models\CatalogItem;
use App\Models\CatalogItemRequirement;
use App\Models\Npc;
use App\Models\User;
use App\Models\UserCatalogItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NpcCatalogItemService
{
    /**
     * Obtiene todos los CatalogItems de un NPC con sus requisitos
     */
    public function getNpcCatalogItems(int $npcId)
    {
        $npc = Npc::with(['activeCatalogItems.requirements.requiredCatalogItem'])
            ->find($npcId);

        if (!$npc) {
            return [
                'success' => false,
                'message' => __('npc.npc_not_found'),
            ];
        }

        $catalogItems = $npc->activeCatalogItems->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'image' => $item->image,
                'image_url' => urlDocker($item->image),
                'sprite_name' => $item->sprite_name,
                'requirements' => $item->requirements->map(function ($requirement) {
                    return [
                        'id' => $requirement->id,
                        'required_catalog_item_id' => $requirement->required_catalog_item_id,
                        'required_quantity' => $requirement->required_quantity,
                        'required_gold_coins' => $requirement->required_gold_coins,
                        'required_silver_coins' => $requirement->required_silver_coins,
                        'required_item' => $requirement->requiredCatalogItem ? [
                            'id' => $requirement->requiredCatalogItem->id,
                            'name' => $requirement->requiredCatalogItem->name,
                            'image' => $requirement->requiredCatalogItem->image,
                            'image_url' => urlDocker($requirement->requiredCatalogItem->image),
                            'sprite_name' => $requirement->requiredCatalogItem->sprite_name,
                        ] : null,
                    ];
                }),
            ];
        });

        return [
            'success' => true,
            'npc' => [
                'id' => $npc->id,
                'name' => $npc->name,
                'description' => $npc->description,
                'type' => $npc->type,
            ],
            'catalog_items' => $catalogItems,
        ];
    }

    /**
     * Verifica si un usuario cumple con los requisitos para reclamar un CatalogItem
     */
    public function checkRequirements(int $catalogItemId, int $userId)
    {
        $catalogItem = CatalogItem::with('requirements.requiredCatalogItem')->find($catalogItemId);
        $user = User::find($userId);

        if (!$catalogItem || !$user) {
            return [
                'success' => false,
                'message' => __('npc.item_not_exists'),
                'has_requirements' => false,
            ];
        }

        $missingRequirements = [];
        $hasAllRequirements = true;

        // Primero calcular totales de monedas requeridas
        $totalGoldRequired = 0;
        $totalSilverRequired = 0;
        foreach ($catalogItem->requirements as $requirement) {
            $totalGoldRequired += $requirement->required_gold_coins;
            $totalSilverRequired += $requirement->required_silver_coins;
        }

        // Verificar créditos de oro
        if ($totalGoldRequired > 0 && $user->gold_coins < $totalGoldRequired) {
            $hasAllRequirements = false;
            $missingRequirements[] = [
                'type' => 'gold_coins',
                'required' => $totalGoldRequired,
                'current' => $user->gold_coins,
                'missing' => $totalGoldRequired - $user->gold_coins,
            ];
        }

        // Verificar créditos de plata
        if ($totalSilverRequired > 0 && $user->silver_coins < $totalSilverRequired) {
            $hasAllRequirements = false;
            $missingRequirements[] = [
                'type' => 'silver_coins',
                'required' => $totalSilverRequired,
                'current' => $user->silver_coins,
                'missing' => $totalSilverRequired - $user->silver_coins,
            ];
        }

        // Verificar CatalogItems requeridos
        foreach ($catalogItem->requirements as $requirement) {
            if ($requirement->required_catalog_item_id) {
                $userItemsCount = UserCatalogItem::where('user_id', $userId)
                    ->where('catalog_item_id', $requirement->required_catalog_item_id)
                    ->whereNull('private_scene_id')
                    ->count();

                if ($userItemsCount < $requirement->required_quantity) {
                    $hasAllRequirements = false;
                    $missingRequirements[] = [
                        'type' => 'catalog_item',
                        'catalog_item_id' => $requirement->required_catalog_item_id,
                        'catalog_item_name' => $requirement->requiredCatalogItem->name ?? 'Desconocido',
                        'required' => $requirement->required_quantity,
                        'current' => $userItemsCount,
                        'missing' => $requirement->required_quantity - $userItemsCount,
                    ];
                }
            }
        }

        return [
            'success' => true,
            'has_requirements' => $hasAllRequirements,
            'missing_requirements' => $missingRequirements,
        ];
    }

    /**
     * Reclama un CatalogItem, verificando y consumiendo los requisitos
     */
    public function claimCatalogItem(int $catalogItemId, int $userId)
    {
        DB::beginTransaction();

        try {
            // Verificar que el CatalogItem existe
            $catalogItem = CatalogItem::with('requirements.requiredCatalogItem')->find($catalogItemId);
            if (!$catalogItem) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => __('npc.item_not_exists'),
                ];
            }

            // Verificar que el usuario existe
            $user = User::find($userId);
            if (!$user) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => __('npc.user_not_found'),
                ];
            }

            // Verificar que el CatalogItem está disponible en algún NPC de tipo 'objects'
            $isAvailable = DB::table('npc_catalog_items')
                ->join('npcs', 'npcs.id', '=', 'npc_catalog_items.npc_id')
                ->where('npc_catalog_items.catalog_item_id', $catalogItemId)
                ->where('npc_catalog_items.active', true)
                ->where('npcs.type', 'objects')
                ->where('npcs.active', true)
                ->exists();

            if (!$isAvailable) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => __('npc.item_not_available_for_exchange'),
                ];
            }

            // Verificar si el item permite compra múltiple
            if (!$catalogItem->is_multi_buy) {
                // Verificar si el usuario ya posee este item
                $userAlreadyHasItem = UserCatalogItem::where('user_id', $userId)
                    ->where('catalog_item_id', $catalogItemId)
                    ->exists();

                if ($userAlreadyHasItem) {
                    DB::rollBack();
                    return [
                        'success' => false,
                        'message' => __('npc.item_already_acquired'),
                    ];
                }
            }

            // Verificar requisitos
            $requirementsCheck = $this->checkRequirements($catalogItemId, $userId);

            if (!$requirementsCheck['success']) {
                DB::rollBack();
                return $requirementsCheck;
            }

            if (!$requirementsCheck['has_requirements']) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => __('npc.requirements_not_met'),
                    'missing_requirements' => $requirementsCheck['missing_requirements'],
                ];
            }

            // Consumir los requisitos
            $consumedItems = [];
            $consumedCoins = [
                'gold_coins' => 0,
                'silver_coins' => 0,
            ];

            foreach ($catalogItem->requirements as $requirement) {
                // Consumir créditos de oro
                if ($requirement->required_gold_coins > 0) {
                    $user->gold_coins -= $requirement->required_gold_coins;
                    $consumedCoins['gold_coins'] += $requirement->required_gold_coins;
                }

                // Consumir créditos de plata
                if ($requirement->required_silver_coins > 0) {
                    $user->silver_coins -= $requirement->required_silver_coins;
                    $consumedCoins['silver_coins'] += $requirement->required_silver_coins;
                }

                // Consumir CatalogItems requeridos
                if ($requirement->required_catalog_item_id) {
                    $userItems = UserCatalogItem::where('user_id', $userId)
                        ->where('catalog_item_id', $requirement->required_catalog_item_id)
                        ->whereNull('private_scene_id')
                        ->limit($requirement->required_quantity)
                        ->get();

                    foreach ($userItems as $userItem) {
                        $userItem->delete();
                    }

                    $consumedItems[] = [
                        'catalog_item_id' => $requirement->required_catalog_item_id,
                        'catalog_item_name' => $requirement->requiredCatalogItem->name ?? 'Desconocido',
                        'quantity' => $requirement->required_quantity,
                    ];
                }
            }

            $user->save();

            // Entregar el nuevo CatalogItem al usuario con el valor de show_in_inventory del CatalogItem
            UserCatalogItem::create([
                'user_id' => $userId,
                'catalog_item_id' => $catalogItemId,
                'show_in_inventory' => $catalogItem->show_in_inventory,
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => __('npc.item_claimed_successfully'),
                'claimed_item' => [
                    'id' => $catalogItem->id,
                    'name' => $catalogItem->name,
                    'image' => $catalogItem->image,
                    'image_url' => urlDocker($catalogItem->image),
                    'sprite_name' => $catalogItem->sprite_name,
                    'show_in_inventory' => $catalogItem->show_in_inventory,
                ],
                'consumed' => [
                    'items' => $consumedItems,
                    'coins' => $consumedCoins,
                ],
                'user' => [
                    'gold_coins' => $user->gold_coins,
                    'silver_coins' => $user->silver_coins,
                ],
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => __('npc.error_claiming_item', ['error' => $e->getMessage()]),
            ];
        }
    }
}
