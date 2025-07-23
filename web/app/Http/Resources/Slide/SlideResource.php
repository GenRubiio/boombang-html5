<?php

namespace App\Http\Resources\Slide;

use App\Enums\SlideTypeEnum;
use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlideResource extends JsonResource
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
            'slider' => (string)SlideTypeEnum::fromKey($this->slider)->name(),
            'title' => (string)$this->title,
            'text' => (string)$this->text,
            'alt' => (string)$this->alt,
            'link' => (string)$this->link,
            'target_blank' => (string)$this->target_blank,
            'button_text' => (string)$this->button_text,
            'image_desktop' => (string)$this->image_desktop,
            'image_tablet' => (string)$this->image_tablet,
            'image_mobile' => (string)$this->image_mobile,
        ];
    }
}
