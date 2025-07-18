<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class VRankingSummaryResource extends JsonResource
{
    use DtoResourceTrait;

    private static $data;

    public function __construct($resource)
    {
        parent::__construct($resource);
        self::$data = $resource;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user' => [
                'id' => (int)$this->user->id,
                'username' => $this->user->username,
                'avatar_id' => $this->user->avatar,
                'rings_won' => (int)$this->user->rings_won,
            ],
            'points' => (int)$this->total_points,
        ];
    }
}
