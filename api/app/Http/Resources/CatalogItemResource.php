<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class CatalogItemResource extends JsonResource
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
            'category_id' => $this->category_id,
            'name' => $this->name,
            'sprite_name' => $this->sprite_name,
            'image' => $this->image,
            'image_url' => urlDocker($this->image),
            'spreadsheet' => $this->spreadsheet,
            'spreadsheet_url' => urlDocker($this->spreadsheet),
            'atlas' => $this->atlas,
            'atlas_url' => !empty($this->atlas) ? urlDocker($this->atlas) : null,
            'description' => $this->description,
            'price' => $this->price,
            'price_type' => $this->price_type,
            'discount' => $this->discount,
            'stars' => $this->stars,
        ];

        if (debug_backtrace()[1]['function'] == "toDTO") {
            if ($this->relationLoaded('category')) {
                $return['category'] = new CatalogCategoryResource($this->whenLoaded('category'));
            }
        } else {
            $return['category'] = new CatalogCategoryResource($this->whenLoaded('category'));
        }

        return $return;
    }
}
