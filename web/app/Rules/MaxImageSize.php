<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxImageSize implements ValidationRule
{
    public $size;

    public function __construct($size = 1024)
    {
        $this->size = $size;
    }

    /**
     * Run the validation rule.
     *
     * @param string $attribute
     * @param mixed $value
     * @param Closure $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $size_in_bytes = (int)(strlen(rtrim($value, '=')) * 3 / 4);
        $size_in_kb = $size_in_bytes / 1024;
        if ($this->size < $size_in_kb) {
            $fail('The :attribute must be less than ' . $this->size . 'KB');
        }
    }
}
