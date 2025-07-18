<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class RankingResource extends JsonResource
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
            'user' => [
                'id' => (int)$this->user->id,
                'username' => $this->user->username,
                'avatar_id' => $this->user->avatar,
                'rings_won' => (int)$this->user->rings_won,
            ],
            'points' => (int)$this->points,
        ];
    }
}
