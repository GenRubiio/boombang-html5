<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum MenuTypeEnum
{
    use EnumTrait;

    case PUBLIC_SCENE;
    case GAME_SCENE;

    public function key(): string
    {
        return match ($this) {
            self::PUBLIC_SCENE => 1,
            self::GAME_SCENE => 2,
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            1 => self::PUBLIC_SCENE,
            2 => self::GAME_SCENE,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::PUBLIC_SCENE => 'Public Scene',
            self::GAME_SCENE => 'Game',
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
