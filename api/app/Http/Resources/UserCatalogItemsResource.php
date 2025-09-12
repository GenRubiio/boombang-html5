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
            'image' => $this->catalogItem->image,
            'image_url' => urlDocker($this->catalogItem->image),
            'spreadsheet' => $this->catalogItem->spreadsheet,
            'spreadsheet_url' => urlDocker($this->catalogItem->spreadsheet),
            'atlas' => $this->catalogItem->atlas,
            'atlas_url' => !empty($this->catalogItem->atlas) ? urlDocker($this->catalogItem->atlas) : null,
            'width' => $this->catalogItem->width,
            'height' => $this->catalogItem->height,
            'rotated' => $this->rotated,
            'resize_enabled' => $this->resize_enabled,
            'resized' => $this->resized,
            'type_of_behavior' => $this->catalogItem->type_of_behavior,
        ];
    }
}
