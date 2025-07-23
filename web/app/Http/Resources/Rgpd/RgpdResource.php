<?php

namespace App\Http\Resources\Rgpd;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RgpdResource extends JsonResource
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
            'email' => (string)$this->email,
            'phone' => (string)$this->phone,
            'ip_consent' => (string)$this->ip_consent,
            'consent' => (bool)$this->consent,
            'datetime_consent' => (string)$this->datetime_consent,
            'active' => (bool)$this->active,
        ];
    }
}
