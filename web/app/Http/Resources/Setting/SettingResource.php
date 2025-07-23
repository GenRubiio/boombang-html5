<?php

namespace App\Http\Resources\Setting;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
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
            'key' => (string)$this->key,
            'type' => (string)$this->type,
            'name' => (string)$this->name,
            'value' => (string)$this->value_formatted,
        ];
    }
}
