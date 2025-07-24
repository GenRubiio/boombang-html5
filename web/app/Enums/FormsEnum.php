<?php

namespace App\Enums;

use App\Traits\EnumTrait;

enum FormsEnum
{
    use EnumTrait;

    case ALL;
    case CONTACT;

    public function key(): string
    {
        return match ($this) {
            self::ALL => 'all',
            self::CONTACT => 'contact',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'all' => self::ALL,
            'contact' => self::CONTACT,
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::ALL => 'All',
            self::CONTACT => 'Contact',
        };
    }
}
