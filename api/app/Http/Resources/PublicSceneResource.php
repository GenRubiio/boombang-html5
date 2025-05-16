<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicSceneResource extends JsonResource
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
            'name' => $this->name,
            'type' => $this->type,
            'menu_type' => $this->menu_type,
            'max_users' => (int)$this->max_users,
            'map_width' => (int)$this->map_width,
            'map_height' => (int)$this->map_height,
            'map' => trim($this->map),
            'start_x' => (int)$this->start_x,
            'start_y' => (int)$this->start_y,
            'start_z' => (int)$this->start_z,
            'start_position' => [
                'x' => (int)$this->start_x,
                'y' => (int)$this->start_y,
                'z' => (int)$this->start_z,
            ],
        ];
    }
}
