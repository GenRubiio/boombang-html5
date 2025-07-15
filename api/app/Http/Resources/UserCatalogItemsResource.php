<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCatalogItemsResource extends JsonResource
{
    use DtoResourceTrait;

    private static $data;

    public function __construct($resource)
    {
        parent::__construct($resource);
        self::$data = $resource;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => (int)$this->id,
            'private_scene_id' => $this->private_scene_id,
            'display_name' => $this->catalogItem->name,
            'sprite_name' => $this->catalogItem->sprite_name,
            'map_size' => $this->catalogItem->map_size,
            'occupied_tiles' => $this->occupied_tiles,
        ];
    }
}
