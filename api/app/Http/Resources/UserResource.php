<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'avatar_id' => $this->avatar,
            'uppercuts_sent' => (int)$this->uppercuts_sent,
            'uppercuts_received' => (int)$this->uppercuts_received,
        ];
    }
}
