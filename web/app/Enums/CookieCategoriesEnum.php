<?php

namespace App\Enums;

use App\Traits\EnumTrait;

enum CookieCategoriesEnum
{
    use EnumTrait;

    case ESSENTIALS;
    case ANALYTICS;
    case OPTIONAL;

    public function key(): string
    {
        return match ($this) {
            self::ESSENTIALS => 'essentials',
            self::ANALYTICS => 'analytics',
            self::OPTIONAL => 'optional',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'essentials' => self::ESSENTIALS,
            'analytics' => self::ANALYTICS,
            'optional' => self::OPTIONAL,
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::ESSENTIALS => 'Essentials',
            self::ANALYTICS => 'Analytics',
            self::OPTIONAL => 'Optional',
        };
    }
}
