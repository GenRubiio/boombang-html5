<?php

namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum PhaserRenderingTypeEnum
{
    use EnumTrait;

    case AUTO;
    case WEBGL;
    case CANVAS;

    public function key(): string
    {
        return match ($this) {
            self::AUTO => 'auto',
            self::WEBGL => 'webgl',
            self::CANVAS => 'canvas',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'auto' => self::AUTO,
            'webgl' => self::WEBGL,
            'canvas' => self::CANVAS,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::AUTO => 'Auto',
            self::WEBGL => 'WebGL',
            self::CANVAS => 'Canvas',
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
