<?php

namespace App\Http\Resources\MenuItem;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
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
            'type' => (string)$this->type,
            'link' => (string)$this->page_link,
            'page_id' => (is_numeric($this->page_id) ? (int)$this->page_id : null),
        ];
    }
}
