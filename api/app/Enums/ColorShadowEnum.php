<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum ColorShadowEnum
{
    use EnumTrait;

    case USER;
    case VIP;
    case ADMIN;

    public function key(): string
    {
        return match ($this) {
            self::USER => 'user',
            self::VIP => 'vip',
            self::ADMIN => 'admin',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'user' => self::USER,
            'vip' => self::VIP,
            'admin' => self::ADMIN,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::USER => 'User',
            self::VIP => 'VIP',
            self::ADMIN => 'Admin',
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
