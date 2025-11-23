<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicSceneTrapResource extends JsonResource
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
            'public_scene_id' => (int)$this->public_scene_id,
            'position_x' => (int)$this->position_x,
            'position_y' => (int)$this->position_y,
            'coconut_type' => (int)$this->coconut_type,
            'coconut_type_name' => $this->coconut_type_name,
            'active' => (bool)$this->active,
        ];
    }
}
