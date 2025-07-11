<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class PrivateSceneResource extends JsonResource
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
        $return = [
            'id' => (int)$this->id,
            'name' => $this->name,
            'colors' => $this->colors,
            'type' => $this->type,
            'island_id' => $this->island_id,
            'has_password' => !empty($this->password),
            'max_users' => (int)$this->privateSceneConfig->max_users,
            'map_width' => (int)$this->privateSceneConfig->map_width,
            'map_height' => (int)$this->privateSceneConfig->map_height,
            'map' => trim($this->privateSceneConfig->map),
            'start_x' => (int)$this->privateSceneConfig->start_x,
            'start_y' => (int)$this->privateSceneConfig->start_y,
            'start_z' => (int)$this->privateSceneConfig->start_z,
            'start_position' => [
                'x' => (int)$this->privateSceneConfig->start_x,
                'y' => (int)$this->privateSceneConfig->start_y,
                'z' => (int)$this->privateSceneConfig->start_z,
            ],
            'my_scene' => Auth::user()->id == $this->user_id,
            'items' => [],
            'objects' => [],
        ];

        if (debug_backtrace()[1]['function'] == "toDTO") {
            if ($this->relationLoaded('island')) {
                $return['island'] = (new IslandResource($this->whenLoaded('island')))->toDTO();
            }
        } else {
            $return['island'] = (new IslandResource($this->whenLoaded('island')));
        }

        return $return;
    }
}
