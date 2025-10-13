<?php
namespace App\Enums;

use InvalidArgumentException;
use App\Enums\Traits\EnumTrait;

enum ApiKeysTypeEnum
{
    use EnumTrait;

    case GEMINI_API_KEY;

    public function key(): string
    {
        return match ($this) {
            self::GEMINI_API_KEY => 'gemini_api_key',
        };
    }

    public static function fromKey(string $key): self
    {
        return match ($key) {
            'gemini_api_key' => self::GEMINI_API_KEY,
            default => throw new InvalidArgumentException("Invalid key: $key"),
        };
    }

    public function name(): string
    {
        return match ($this) {
            self::GEMINI_API_KEY => 'Gemini API Key',
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
