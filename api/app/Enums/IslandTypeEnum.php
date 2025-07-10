<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum IslandTypeEnum
{
    use EnumTrait;

    case ISLA1;
    case ISLA2;
    case ISLA3;
    case ISLA4;
    case ISLA5;

    public function key(): string
    {
        return match ($this) {
            self::ISLA1 => 1,
            self::ISLA2 => 2,
            self::ISLA3 => 3,
            self::ISLA4 => 4,
            self::ISLA5 => 5,
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            1 => self::ISLA1,
            2 => self::ISLA2,
            3 => self::ISLA3,
            4 => self::ISLA4,
            5 => self::ISLA5,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::ISLA1 => 'Isla Canarias',
            self::ISLA2 => 'Isla Vulcano',
            self::ISLA3 => 'Isla Hielo',
            self::ISLA4 => 'Isla Desierto',
            self::ISLA5 => 'Isla Murciélago',
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
