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
        $return = [
            'id' => (int)$this->id,
            'username' => $this->username,
            'lang' => $this->lang,
            'description' => $this->description,
            'ficha_color' => $this->ficha_color,
            'shadow_color' => $this->shadow_color,
            'chat_color' => $this->chat_color,
            'name_color' => $this->name_color,
            'email' => $this->email,
            'avatar_id' => $this->avatar,
            'gold_coins' => (int)$this->gold_coins,
            'silver_coins' => (int)$this->silver_coins,
            'rings_won' => (int)$this->rings_won,
            'coconuts_caught' => (int)$this->coconuts_caught,
            'uppercuts_sent' => (int)$this->uppercuts_sent,
            'uppercuts_received' => (int)$this->uppercuts_received,
            'coconuts_sent' => (int)$this->coconuts_sent,
            'coconuts_received' => (int)$this->coconuts_received,

            'phaser_rendering_type' => $this->phaser_rendering_type,
            'phaser_antialias' => $this->phaser_antialias,
            'phaser_antialias_gl' => $this->phaser_antialias_gl,
            'phaser_pixel_art' => $this->phaser_pixel_art,
            'phaser_round_pixels' => $this->phaser_round_pixels,
            'phaser_power_preference' => $this->phaser_power_preference,
            
            /**
             * User customizations
             */
            'fichas' => $this->enabledFichas(),
            'chats' => $this->enabledChats(),
            'colornames' => $this->enabledColorNames(),
            'shadows' => $this->enabledShadows(),
        ];

        return $return;
    }
}
