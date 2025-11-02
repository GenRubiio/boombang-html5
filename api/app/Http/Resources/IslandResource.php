<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\PrivateSceneResource;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class IslandResource extends JsonResource
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
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'is_uppercut_active' => $this->is_uppercut_active,
            'user_id' => $this->user_id,
            'user' => [
                'username' => $this->user->username,
                'avatar_id' => $this->user->avatar,
            ],
        ];

        // Agregar información de la configuración de isla si existe
        if ($this->islandConfig) {
            $return['island_config'] = [
                'id' => $this->islandConfig->id,
                'name' => $this->islandConfig->name,
                'image' => $this->islandConfig->image,
                'image_url' => urlDocker($this->islandConfig->image),
            ];
        }

        if (debug_backtrace()[1]['function'] == "toDTO") {
            if ($this->relationLoaded('privateScenes')) {
                $return['scenes'] = PrivateSceneResource::collectionToDTO($this->whenLoaded('privateScenes'));
            }
        } else {
            $return['scenes'] = PrivateSceneResource::collection($this->whenLoaded('privateScenes'));
        }

        return $return;
    }
}
