<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class SceneItemResource extends JsonResource
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
            'file_name' => $this->file_name,
            'time' => $this->whenPivotLoaded('public_scene_items', function () {
                return (int)$this->pivot->time;
            }),
            'min_users' => $this->whenPivotLoaded('public_scene_items', function () {
                return (int)$this->pivot->min_users;
            }),
        ];
    }
}
