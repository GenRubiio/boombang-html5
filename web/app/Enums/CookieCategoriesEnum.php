<?php

namespace App\Enums;

enum CookieCategoriesEnum
{
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
    public function name(): string
    {
        return match ($this) {
            self::ESSENTIALS => 'Essentials',
            self::ANALYTICS => 'Analytics',
            self::OPTIONAL => 'Optional',
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
