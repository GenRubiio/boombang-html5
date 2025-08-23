<?php

namespace App\Http\Controllers\Api\Game\Catalog;

use Exception;
use App\Models\CatalogItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class LobbyGachaApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function items(Request $request): JsonResource
    {
        try {
            $items = CatalogItem::where('in_lobby_gacha', true)
                ->where('is_active', true)
                ->get();

            $items = [];
            foreach ($items as $item) {
                $items[$item->type][$item->stars][] = $item;
            }

            return $this->successResponse(
                [
                    'items' => $items
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
