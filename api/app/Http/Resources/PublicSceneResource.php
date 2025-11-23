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
        $return = [
            'id' => (int)$this->id,
            'parent_id' => (int)$this->parent_id,
            'name' => $this->name,
            'type' => $this->type,
            'darkening' => (bool)$this->darkening,
            'sound' => $this->sound,
            'sound_url' => urlDocker($this->sound),
            'menu_type' => $this->menu_type,
            'big_scene' => (bool)$this->big_scene,
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
            'base_api_url' => config('app.url'),
            'assets_data' => $this->assets_data ? json_decode($this->assets_data, true) : [],
            'arrows' => $this->arrows(),
            'traps' => PublicSceneTrapResource::collection($this->traps()->where('active', true)->get()),
        ];

        if (debug_backtrace()[1]['function'] == "toDTO") {
            if ($this->relationLoaded('items')) {
                $return['items'] = SceneItemResource::collectionToDTO($this->whenLoaded('items'));
                $return['npc'] = (new NpcResource($this->whenLoaded('npc')))->toDTO();
            }
        } else {
            $return['items'] = SceneItemResource::collection($this->whenLoaded('items'));
            $return['npc'] = (new NpcResource($this->whenLoaded('npc')));
        }

        return $return;
    }
}
