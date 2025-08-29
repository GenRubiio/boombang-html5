<?php

namespace App\Http\Controllers\Api\Game\Object;

use Exception;
use Illuminate\Http\Request;
use App\Models\UserCatalogItem;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class RotateObjectApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_catalog_item_id' => 'required|integer|exists:user_catalog_items,id',
                'rotated' => 'required|boolean',
            ]);
            $user = Auth::user();
            $responseUpdate = UserCatalogItem::where('id', $validated['user_catalog_item_id'])
                ->where('user_id', $user->id)
                ->whereNotNull('private_scene_id')
                ->update([
                    'rotated' => $validated['rotated'],
                ]);

            if ($responseUpdate == 0) {
                throw new Exception('Item does not belong to the current private scene or does not exist.');
            }
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
