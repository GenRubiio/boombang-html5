<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Models\CatalogItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class SceneUserAvatarsApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(): JsonResource
    {
        try {
            $lang = auth()->user()->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $items = CatalogItem::where('is_active', true)
                ->whereNotNull('user_decoration_type')
                ->where('user_decoration_type', 'avatar')
                ->get();

            $avatars = [];

            foreach ($items as $item) {
                //check if auth user has this avatar
                $hasAvatar = auth()->user()->userCatalogItems()->where('catalog_item_id', $item->id)->exists();
                $avatars[] = [
                    'key' => $item->user_decoration_value,
                    'image' => urlDocker($item->image), // All decoration types now use images
                    'description' => $item->description,
                    'owned' => $hasAvatar
                ];
            }

            return $this->successResponse([
                'avatars' => $avatars
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
