<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class IslandConfigResource extends JsonResource
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
            'image' => $this->image,
            'image_url' => urlDocker($this->image)
        ];
        return $return;
    }
}
