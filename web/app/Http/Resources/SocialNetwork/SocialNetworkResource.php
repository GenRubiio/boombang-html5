<?php

namespace App\Http\Resources\SocialNetwork;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialNetworkResource extends JsonResource
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
            'name' => (string)$this->name,
            'link' => (string)$this->link,
            'icon' => (string)$this->icon,
            'background_color' => (string)$this->background_color,
            'image' => (string)$this->image_url,
        ];
    }
}
