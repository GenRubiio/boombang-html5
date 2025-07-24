<?php

namespace App\Enums;

use App\Traits\EnumTrait;

enum SlideTypeEnum
{
    use EnumTrait;

    case HOME;

    public function key(): string
    {
        return match ($this) {
            self::HOME => 'home',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'home' => self::HOME,
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::HOME => 'Home',
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

    public static function keys(): array
    {
        $array = [];
        foreach (self::cases() as $case) {
            $array[] = $case->key();
        }
        return $array;
    }
}
