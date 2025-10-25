<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaV2 implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $resp = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret'   => config('services.recaptcha.secret'),
            'response' => $value,
            'remoteip' => request()->ip(),
        ]);

        if (!$resp->ok()) {
            Log::warning('reCAPTCHA HTTP error', ['status' => $resp->status(), 'body' => $resp->body()]);
            $fail(__('Error de verificación reCAPTCHA.'));
            return;
        }

        $json = $resp->json();

        if (!($json['success'] ?? false)) {
            // Útil para depurar: invalid-input-secret, invalid-input-response, timeout-or-duplicate, etc.
            Log::info('reCAPTCHA failed', ['error-codes' => $json['error-codes'] ?? []]);
            $fail(__('El reCAPTCHA no es válido o ha expirado.'));
        }
    }
}
