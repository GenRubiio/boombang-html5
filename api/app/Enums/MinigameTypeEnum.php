<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum MinigameTypeEnum
{
    use EnumTrait;

    case RING;
    case CRAZY_COCONUTS;

    public function key(): string
    {
        return match ($this) {
            self::RING => 'ring',
            self::CRAZY_COCONUTS => 'crazy_coconuts',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'ring' => self::RING,
            'crazy_coconuts' => self::CRAZY_COCONUTS,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::RING => 'Ring',
            self::CRAZY_COCONUTS => 'Crazy Coconuts',
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
