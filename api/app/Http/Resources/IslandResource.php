<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\Traits\DtoResourceTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class IslandResource extends JsonResource
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
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'is_uppercut_active' => $this->is_uppercut_active,
            'user_id' => $this->user_id,
            'my_island' => Auth::user()->id == $this->user_id,
            'user' => [
                'username' => $this->user->username,
                'avatar_id' => $this->user->avatar,
            ],
            'scenes' => []
        ];
    }
}
