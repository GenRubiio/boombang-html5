<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum PhaserPowerPreferenceEnum
{
    use EnumTrait;

    case DEFAULT;
    case HIGH_PERFORMANCE;
    case LOW_POWER;

    public function key(): string
    {
        return match ($this) {
            self::DEFAULT => 'default',
            self::HIGH_PERFORMANCE => 'high-performance',
            self::LOW_POWER => 'low-power',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'default' => self::DEFAULT,
            'high-performance' => self::HIGH_PERFORMANCE,
            'low-power' => self::LOW_POWER,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::DEFAULT => 'Default',
            self::HIGH_PERFORMANCE => 'High Performance',
            self::LOW_POWER => 'Low Power',
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
