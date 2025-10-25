<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Models\CatalogItem;

class SceneUserDecorationsApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(): JsonResource
    {
        try {
            $lang = auth()->user()->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $items = CatalogItem::where('is_active', true)
                ->whereNotNull('user_decoration_type')
                ->whereIn('user_decoration_type', ['ficha', 'chat', 'name', 'shadow'])
                ->get();

            // Group items by decoration type
            $decorations = [
                'ficha' => [],
                'chat' => [],
                'name' => [],
                'shadow' => []
            ];

            foreach ($items as $item) {
                $decorationData = [
                    'key' => $item->user_decoration_value,
                    'image' => urlDocker($item->image), // All decoration types now use images
                    'description' => $item->description
                ];

                $decorations[$item->user_decoration_type][] = $decorationData;
            }

            return $this->successResponse([
                'decorations' => $decorations
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
