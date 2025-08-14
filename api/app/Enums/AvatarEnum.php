<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum AvatarEnum
{
    use EnumTrait;

    case BOOMER;
    case BRUJITA;
    case CHOLO;
    case EMPOLLON;
    case GATA;
    case GHOST;
    case INDIA;
    case LILIAN;
    case MARSU;
    case MODERN;
    case NINJA;
    case RASTA;
    case SKELETON;
    case WEREWOLF;
    case WRAITH;
    case YAYO;
    case ZOMBIE;

    public function key(): string
    {
        return match ($this) {
            self::BOOMER => 1,
            self::BRUJITA => 2,
            self::CHOLO => 3,
            self::EMPOLLON => 4,
            self::GATA => 5,
            self::GHOST => 6,
            self::INDIA => 7,
            self::LILIAN => 8,
            self::MARSU => 9,
            self::MODERN => 10,
            self::NINJA => 11,
            self::RASTA => 12,
            self::SKELETON => 13,
            self::WEREWOLF => 14,
            self::WRAITH => 15,
            self::YAYO => 16,
            self::ZOMBIE => 17,
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            1 => self::BOOMER,
            2 => self::BRUJITA,
            3 => self::CHOLO,
            4 => self::EMPOLLON,
            5 => self::GATA,
            6 => self::GHOST,
            7 => self::INDIA,
            8 => self::LILIAN,
            9 => self::MARSU,
            10 => self::MODERN,
            11 => self::NINJA,
            12 => self::RASTA,
            13 => self::SKELETON,
            14 => self::WEREWOLF,
            15 => self::WRAITH,
            16 => self::YAYO,
            17 => self::ZOMBIE,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::BOOMER => 'Boomer',
            self::BRUJITA => 'Brujita',
            self::CHOLO => 'Cholo',
            self::EMPOLLON => 'Empollon',
            self::GATA => 'Gata',
            self::GHOST => 'Ghost',
            self::INDIA => 'India',
            self::LILIAN => 'Lilian',
            self::MARSU => 'Marsu',
            self::MODERN => 'Modern',
            self::NINJA => 'Ninja',
            self::RASTA => 'Rasta',
            self::SKELETON => 'Skeleton',
            self::WEREWOLF => 'Werewolf',
            self::WRAITH => 'Wraith',
            self::YAYO => 'Yayo',
            self::ZOMBIE => 'Zombie',
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

    public static function registerAvatarPermited(): array
    {
        return [
            self::GATA->key(),
            self::RASTA->key(),
        ];
    }
}
