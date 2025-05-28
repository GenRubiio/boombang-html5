<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum MinigameSceneTypeEnum
{
    use EnumTrait;

    case GOLDEN_RING;

    public function key(): string
    {
        return match ($this) {
            self::GOLDEN_RING => 1,
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            1 => self::GOLDEN_RING,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::GOLDEN_RING => 'Golden Ring',
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
