<?php

namespace App\Http\Resources\Gallery;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryImageResource extends JsonResource
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
        //$imageSize = getimagesize($this->image);
        return [
            'id' => (int)$this->id,
            'galleryable_id' => (int)$this->galleryable_id,
            'galleryable_type' => (string)$this->galleryable_type,
            'type' => (string)$this->type,
            'name' => (string)$this->name,
            'alt' => (string)$this->alt,
            'title' => (string)$this->title,
            'image' => (string)$this->image_url,
            //'width' => (int)$imageSize[0] ?? 0,
            //'height' => (int)$imageSize[1] ?? 0,
        ];
    }
}
