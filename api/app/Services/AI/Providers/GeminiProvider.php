<?php

namespace App\Services\AI\Providers;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\AI\Contracts\AIProviderInterface;

class GeminiProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;

    /**
     * @param string $apiKey
     * @param string $model  Ej: 'gemini-2.5-flash-lite' (recomendado) o 'gemini-1.5-pro'
     */
    public function __construct(string $apiKey, string $model = 'gemini-2.5-flash-lite')
    {
        $this->apiKey = $apiKey;
        $this->model  = $model;
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }

    /**
     * Genera una respuesta de chat.
     *
     * $systemPrompt: prompt de sistema/rol (v1beta → systemInstruction; v1 → lo puedes inyectar como primer turno user si quisieras).
     * $messages: [ ['role' => 'user'|'assistant', 'content' => '...'], ... ]
     * $options:  ['temperature' => float, 'top_p' => float, 'max_tokens' => int]
     */
    public function generate(string $systemPrompt, array $messages, array $options = []): array
    {
        // 1) Selección de versión de API según modelo
        $useV1Beta = $this->modelIs2x($this->model); // 2.x → v1beta; 1.5/anteriores → v1
        $version   = $useV1Beta ? 'v1beta' : 'v1';

        // 2) Historial completo en formato Gemini
        $contents = $this->formatMessages($messages);

        // 3) generationConfig básico (no enviamos thinkingBudget)
        $generationConfig = [
            'temperature' => $options['temperature'] ?? 0.9,
            'topP'        => $options['top_p'] ?? 0.95,
        ];
        if (!empty($options['max_tokens']) && (int)$options['max_tokens'] >= 100) {
            $generationConfig['maxOutputTokens'] = (int)$options['max_tokens'];
        }

        // 4) Payload base
        $payload = [
            'contents' => $contents,
        ];

        // 5) Campos extra solo si usamos v1beta (series 2.x)
        if ($useV1Beta) {
            // systemPrompt como systemInstruction
            if (!empty($systemPrompt)) {
                $payload['systemInstruction'] = [
                    'parts' => [
                        ['text' => $systemPrompt],
                    ],
                ];
            }
            // Forzar texto plano para evitar formatos raros
            $generationConfig['responseMimeType'] = 'text/plain';
        }

        $payload['generationConfig'] = $generationConfig;

        // 6) URL
        $url = $this->endpointUrl($version);

        // 7) Disparo con fallback si hay campos desconocidos
        try {
            $res = $this->send($url, $payload);

            if (!$res->successful()) {
                $body = $res->body();
                // Fallback si el backend rechaza campos (p. ej. responseMimeType en algún despliegue)
                if ($res->status() === 400 && $this->hasUnknownFieldError($body)) {
                    Log::warning('Gemini 400 Unknown field: applying safe fallback payload', [
                        'version' => $version,
                        'body'    => $body,
                    ]);

                    // Quitar extras problemáticos y reintentar misma versión
                    $fallback = [
                        'contents' => $contents,
                        'generationConfig' => [
                            'temperature' => $options['temperature'] ?? 0.9,
                            'topP'        => $options['top_p'] ?? 0.95,
                        ],
                    ];
                    if (!empty($options['max_tokens']) && (int)$options['max_tokens'] >= 100) {
                        $fallback['generationConfig']['maxOutputTokens'] = (int)$options['max_tokens'];
                    }

                    $res = $this->send($url, $fallback);

                    // Segundo fallback: si aún falla y el modelo NO es 2.x, probar v1
                    if (!$res->successful() && !$useV1Beta) {
                        $urlV1 = $this->endpointUrl('v1');
                        $res   = $this->send($urlV1, $fallback);
                    }
                }
            }

            if (!$res->successful()) {
                throw new Exception("Gemini API error: " . $res->body());
            }

            $data = $res->json();

            Log::info('Gemini raw response', [
                'status'        => $res->status(),
                'usageMetadata' => $data['usageMetadata'] ?? null,
                'finishReason'  => $data['candidates'][0]['finishReason'] ?? null,
            ]);

            // 8) Extraer texto
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if ($text === null) {
                $finish   = $data['candidates'][0]['finishReason'] ?? '';
                $thoughts = $data['usageMetadata']['thoughtsTokenCount'] ?? 0;

                if ($finish === 'MAX_TOKENS' && $thoughts > 0) {
                    // Nota: ya no enviamos thinkingBudget; si ocurre, sube maxOutputTokens o acorta prompts.
                    throw new Exception("La respuesta agotó tokens sin texto útil. Sube maxOutputTokens o reduce el prompt.");
                }

                throw new Exception("Estructura de respuesta inesperada (sin texto).");
            }

            return [
                'content'  => trim($text),
                'tokens'   => [
                    'prompt_tokens'     => $data['usageMetadata']['promptTokenCount'] ?? 0,
                    'completion_tokens' => $data['usageMetadata']['candidatesTokenCount'] ?? 0,
                    'total_tokens'      => $data['usageMetadata']['totalTokenCount'] ?? 0,
                ],
                'model'    => $this->model,
                'provider' => 'gemini',
            ];
        } catch (Exception $e) {
            Log::error('GeminiProvider error', [
                'error' => $e->getMessage(),
                'model' => $this->model,
            ]);
            throw $e;
        }
    }

    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    public function getCapabilities(): array
    {
        return [
            'streaming'  => false,
            'vision'     => str_contains($this->model, 'vision'),
            'max_tokens' => 8192,
            'languages'  => ['es', 'en', 'ru', 'ja', 'zh', 'ko'],
        ];
    }

    // ======= Helpers =======

    /**
     * Convierte tu historial [{role, content}] a formato Gemini [{role, parts[]}]
     */
    protected function formatMessages(array $messages): array
    {
        $contents = [];

        foreach ($messages as $m) {
            $role = $m['role'] ?? 'user';
            $geminiRole = $role === 'assistant' ? 'model' : 'user';

            $text = (string)($m['content'] ?? '');
            $contents[] = [
                'role'  => $geminiRole,
                'parts' => [['text' => $text]],
            ];
        }

        if (empty($contents)) {
            $contents[] = [
                'role'  => 'user',
                'parts' => [['text' => '']],
            ];
        }

        return $contents;
    }

    protected function modelIs2x(string $model): bool
    {
        // Cubre gemini-2.0*, 2.5*, etc.
        return (bool)preg_match('/\bgemini-2\./i', $model);
    }

    protected function endpointUrl(string $version): string
    {
        return "https://generativelanguage.googleapis.com/{$version}/models/{$this->model}:generateContent?key={$this->apiKey}";
    }

    protected function send(string $url, array $payload)
    {
        Log::info('Gemini request', [
            'url'     => $url,
            'payload' => $payload,
        ]);

        return Http::timeout(30)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);
    }

    protected function hasUnknownFieldError(string $body): bool
    {
        // Detecta errores típicos de “campo desconocido”
        return str_contains($body, 'Unknown name "systemInstruction"')
            || str_contains($body, 'Unknown name "responseMimeType"')
            || str_contains($body, 'Unknown name "thinkingBudget"')
            || str_contains($body, 'Cannot find field');
    }
}
