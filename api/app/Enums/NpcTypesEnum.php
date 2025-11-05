<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum NpcTypesEnum
{
    use EnumTrait;

    case DEFAULT;
    case RING;
    case OBJECTS;

    public function key(): string
    {
        return match ($this) {
            self::DEFAULT => 'default',
            self::RING => 'ring',
            self::OBJECTS => 'objects',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'default' => self::DEFAULT,
            'ring' => self::RING,
            'objects' => self::OBJECTS,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::DEFAULT => 'Default',
            self::RING => 'Ring',
            self::OBJECTS => 'Objects',
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
