<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum CatalogItemTypeOfBehaviorEnum
{
    use EnumTrait;

    case NORMAL;
    case FLYING;
    case WALKABLE;
    case WALKABLE_OVERLAY;

    public function key(): string
    {
        return match ($this) {
            self::NORMAL => 'normal',
            self::FLYING => 'flying',
            self::WALKABLE => 'walkable',
            self::WALKABLE_OVERLAY => 'walkable_overlay',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'normal' => self::NORMAL,
            'flying' => self::FLYING,
            'walkable' => self::WALKABLE,
            'walkable_overlay' => self::WALKABLE_OVERLAY,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::NORMAL => 'Normal',
            self::FLYING => 'Flying',
            self::WALKABLE => 'Walkable',
            self::WALKABLE_OVERLAY => 'Walkable Overlay',
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
