<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum CatalogItemTypesEnum
{
    use EnumTrait;

    case SCENE_ITEM;
    case USER_DECORATION;
    case USER_AVATAR;

    public function key(): string
    {
        return match ($this) {
            self::USER_DECORATION => 'user_decoration',
            self::SCENE_ITEM => 'scene_item',
            self::USER_AVATAR => 'user_avatar',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'user_decoration' => self::USER_DECORATION,
            'scene_item' => self::SCENE_ITEM,
            'user_avatar' => self::USER_AVATAR,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::USER_DECORATION => 'User Decoration',
            self::SCENE_ITEM => 'Scene Item',
            self::USER_AVATAR => 'User Avatar',
        };
    }

    public static function toAssociativeArray(): array
    {
        $array = [];
        foreach (self::cases() as $case) {
            $array[$case->key()] = $case->name();
        }
        return $array;
    }
}
