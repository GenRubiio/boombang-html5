<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class NpcResource extends JsonResource
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
            'stripe_name' => $this->stripe_name,
            'description' => $this->description,
            'image' => $this->image,
            'image_url' => urlDocker($this->image),
            'position_x' => (int)$this->position_x,
            'position_y' => (int)$this->position_y,
            'depth' => (int)$this->depth,
            'active' => (bool)$this->active,
        ];
    }
}
