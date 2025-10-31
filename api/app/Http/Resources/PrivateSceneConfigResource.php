<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class PrivateSceneConfigResource extends JsonResource
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
            'island_type' => (int)$this->island_type,
            'name' => $this->name,
            'image' => $this->image,
            'image_url' => urlDocker($this->image),
            'default_colors' => $this->default_colors ? json_decode($this->default_colors, true) : [],
            'base_api_url' => config('app.url'),
            'assets_data' => $this->assets_data ? json_decode($this->assets_data, true) : [],
        ];
        return $return;
    }
}
