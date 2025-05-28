<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum PublicSceneTypeEnum
{
    use EnumTrait;

    case BELUGA_BEACH;
    case UFO;

    public function key(): string
    {
        return match ($this) {
            self::BELUGA_BEACH => 1,
            self::UFO => 2,
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            1 => self::BELUGA_BEACH,
            2 => self::UFO,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::BELUGA_BEACH => 'Beluga Beach',
            self::UFO => 'UFO',
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
