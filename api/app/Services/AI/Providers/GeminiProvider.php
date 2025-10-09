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

    public function __construct(string $apiKey, string $model = 'gemini-2.5-flash')
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }

    public function generate(string $systemPrompt, array $messages, array $options = []): array
    {
        try {
            // Convert messages to Gemini format
            $contents = $this->formatMessages($systemPrompt, $messages);

            $payload = [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => $options['temperature'] ?? 0.9,
                    'maxOutputTokens' => $options['max_tokens'] ?? 800,
                    'topP' => $options['top_p'] ?? 0.95,
                ],
            ];

            $url = "https://generativelanguage.googleapis.com/v1/models/{$this->model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout(30)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $payload);

            if (!$response->successful()) {
                throw new Exception("Gemini API error: " . $response->body());
            }

            $data = $response->json();

            if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                throw new Exception("Invalid Gemini response structure");
            }

            $content = $data['candidates'][0]['content']['parts'][0]['text'];
            
            return [
                'content' => trim($content),
                'tokens' => [
                    'prompt_tokens' => $data['usageMetadata']['promptTokenCount'] ?? 0,
                    'completion_tokens' => $data['usageMetadata']['candidatesTokenCount'] ?? 0,
                    'total_tokens' => $data['usageMetadata']['totalTokenCount'] ?? 0,
                ],
                'model' => $this->model,
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
            'streaming' => false,
            'vision' => str_contains($this->model, 'vision'),
            'max_tokens' => 8192,
            'languages' => ['es', 'en', 'ru', 'ja', 'zh', 'ko'],
        ];
    }

    /**
     * Format messages for Gemini API
     */
    protected function formatMessages(string $systemPrompt, array $messages): array
    {
        $contents = [];

        // Add system prompt as first user message
        if (!empty($systemPrompt)) {
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $systemPrompt]],
            ];
            $contents[] = [
                'role' => 'model',
                'parts' => [['text' => 'OK']],
            ];
        }

        // Add conversation messages
        foreach ($messages as $msg) {
            $role = $msg['role'] === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['content']]],
            ];
        }

        return $contents;
    }
}
