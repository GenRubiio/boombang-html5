<?php

namespace App\Http\Controllers\Api\Game\Npc;

use Exception;
use App\Services\NpcCatalogItemService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class NpcCatalogItemApiController extends Controller
{
    use ResponseApiControllerTrait;

    protected $npcCatalogItemService;

    public function __construct(NpcCatalogItemService $npcCatalogItemService)
    {
        $this->npcCatalogItemService = $npcCatalogItemService;
    }

    /**
     * @OA\Post(
     *     path="/api/npc/catalog-items",
     *     summary="Obtener objetos de un NPC",
     *     description="Obtiene todos los objetos disponibles en un NPC de tipo 'objects' junto con sus requisitos de intercambio",
     *     tags={"NPC - Intercambio de Objetos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"npc_id"},
     *             @OA\Property(property="npc_id", type="integer", example=1, description="ID del NPC")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Objetos del NPC obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="npc",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Comerciante de Objetos"),
     *                 @OA\Property(property="type", type="string", example="objects")
     *             ),
     *             @OA\Property(
     *                 property="catalog_items",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=5),
     *                     @OA\Property(property="name", type="string", example="Espada Legendaria"),
     *                     @OA\Property(property="description", type="string", example="Una espada poderosa"),
     *                     @OA\Property(property="image", type="string", example="uploads/catalog/espada.png"),
     *                     @OA\Property(property="image_url", type="string", example="http://api.boombang.com/uploads/catalog/espada.png"),
     *                     @OA\Property(property="sprite_name", type="string", example="legendary_sword"),
     *                     @OA\Property(
     *                         property="requirements",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="required_catalog_item_id", type="integer", example=3),
     *                             @OA\Property(property="required_quantity", type="integer", example=2),
     *                             @OA\Property(property="required_gold_coins", type="integer", example=100),
     *                             @OA\Property(property="required_silver_coins", type="integer", example=0),
     *                             @OA\Property(
     *                                 property="required_item",
     *                                 type="object",
     *                                 @OA\Property(property="id", type="integer", example=3),
     *                                 @OA\Property(property="name", type="string", example="Gema Azul"),
     *                                 @OA\Property(property="image", type="string"),
     *                                 @OA\Property(property="image_url", type="string"),
     *                                 @OA\Property(property="sprite_name", type="string")
     *                             )
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=400, description="NPC no encontrado o parámetros inválidos"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function getNpcCatalogItems()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception(__('npc.user_not_authenticated'));
            }

            $lang = $user->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $npcId = request('npc_id');

            if (!$npcId) {
                throw new Exception(__('npc.npc_id_required'));
            }

            $result = $this->npcCatalogItemService->getNpcCatalogItems($npcId);

            if ($result['success']) {
                return $this->successResponse($result);
            }

            throw new Exception($result['message'] ?? __('npc.error_getting_npc_items', ['error' => '']));
        } catch (Exception $e) {
            return $this->errorResponse(__('npc.error_getting_npc_items', ['error' => $e->getMessage()]));
        }
    }

    /**
     * @OA\Post(
     *     path="/api/npc/check-requirements",
     *     summary="Verificar requisitos para un objeto",
     *     description="Verifica si el usuario cumple con los requisitos necesarios para reclamar un objeto del NPC",
     *     tags={"NPC - Intercambio de Objetos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"catalog_item_id"},
     *             @OA\Property(property="catalog_item_id", type="integer", example=5, description="ID del objeto a reclamar")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Verificación completada",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="has_requirements", type="boolean", example=false, description="true si cumple todos los requisitos"),
     *             @OA\Property(
     *                 property="missing_requirements",
     *                 type="array",
     *                 description="Lista de requisitos que faltan (vacío si cumple todos)",
     *                 @OA\Items(
     *                     @OA\Property(property="type", type="string", example="catalog_item", description="Tipo: catalog_item, gold_coins, silver_coins"),
     *                     @OA\Property(property="catalog_item_id", type="integer", example=3),
     *                     @OA\Property(property="catalog_item_name", type="string", example="Gema Azul"),
     *                     @OA\Property(property="required", type="integer", example=2, description="Cantidad requerida"),
     *                     @OA\Property(property="current", type="integer", example=1, description="Cantidad actual"),
     *                     @OA\Property(property="missing", type="integer", example=1, description="Cantidad faltante")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=400, description="Objeto no encontrado o parámetros inválidos"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function checkRequirements()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception(__('npc.user_not_authenticated'));
            }

            $lang = $user->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $catalogItemId = request('catalog_item_id');

            if (!$catalogItemId) {
                throw new Exception(__('npc.catalog_item_id_required'));
            }

            $result = $this->npcCatalogItemService->checkRequirements($catalogItemId, $user->id);

            if ($result['success']) {
                return $this->successResponse($result);
            }

            throw new Exception($result['message'] ?? __('npc.could_not_verify_requirements'));
        } catch (Exception $e) {

            return $this->errorResponse(__('npc.error_checking_requirements', ['error' => $e->getMessage()]));
        }
    }

    /**
     * @OA\Post(
     *     path="/api/npc/claim-item",
     *     summary="Reclamar objeto del NPC",
     *     description="Reclama un objeto del NPC. Verifica requisitos, consume recursos (items y créditos) y entrega el nuevo objeto. Todo en una transacción con rollback automático si falla.",
     *     tags={"NPC - Intercambio de Objetos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"catalog_item_id"},
     *             @OA\Property(property="catalog_item_id", type="integer", example=5, description="ID del objeto a reclamar")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Objeto reclamado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Objeto reclamado exitosamente"),
     *             @OA\Property(
     *                 property="claimed_item",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=5),
     *                 @OA\Property(property="name", type="string", example="Espada Legendaria"),
     *                 @OA\Property(property="image", type="string"),
     *                 @OA\Property(property="image_url", type="string"),
     *                 @OA\Property(property="sprite_name", type="string")
     *             ),
     *             @OA\Property(
     *                 property="consumed",
     *                 type="object",
     *                 @OA\Property(
     *                     property="items",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="catalog_item_id", type="integer", example=3),
     *                         @OA\Property(property="catalog_item_name", type="string", example="Gema Azul"),
     *                         @OA\Property(property="quantity", type="integer", example=2)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="coins",
     *                     type="object",
     *                     @OA\Property(property="gold_coins", type="integer", example=100),
     *                     @OA\Property(property="silver_coins", type="integer", example=0)
     *                 )
     *             ),
     *             @OA\Property(
     *                 property="user",
     *                 type="object",
     *                 description="Créditos actuales del usuario después del intercambio",
     *                 @OA\Property(property="gold_coins", type="integer", example=900),
     *                 @OA\Property(property="silver_coins", type="integer", example=500)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=400, description="No cumple requisitos, objeto no disponible o parámetros inválidos"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function claimItem()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception(__('npc.user_not_authenticated'));
            }

            $lang = $user->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $catalogItemId = request('catalog_item_id');

            if (!$catalogItemId) {
                throw new Exception(__('npc.catalog_item_id_required'));
            }

            $result = $this->npcCatalogItemService->claimCatalogItem($catalogItemId, $user->id);

            if ($result['success']) {
                return $this->successResponse($result);
            }

            // Devolver la respuesta de error completa con missing_requirements
            return new \Illuminate\Http\Resources\Json\JsonResource($result);
        } catch (Exception $e) {

            return $this->errorResponse(__('npc.error_claiming_item', ['error' => $e->getMessage()]));
        }
    }
}
