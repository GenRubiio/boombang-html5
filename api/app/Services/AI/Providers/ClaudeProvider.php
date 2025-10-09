<?php

namespace App\Services\AI\Providers;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\AI\Contracts\AIProviderInterface;

class ClaudeProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;

    public function __construct(string $apiKey, string $model = 'claude-3-5-sonnet-20241022')
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
    }

    public function getProviderName(): string
    {
        return 'claude';
    }

    public function generate(string $systemPrompt, array $messages, array $options = []): array
    {
        try {
            $payload = [
                'model' => $this->model,
                'max_tokens' => $options['max_tokens'] ?? 800,
                'temperature' => $options['temperature'] ?? 0.9,
                'messages' => $messages,
            ];

            if (!empty($systemPrompt)) {
                $payload['system'] = $systemPrompt;
            }

            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.anthropic.com/v1/messages', $payload);

            if (!$response->successful()) {
                throw new Exception("Claude API error: " . $response->body());
            }

            $data = $response->json();

            if (!isset($data['content'][0]['text'])) {
                throw new Exception("Invalid Claude response structure");
            }

            $content = $data['content'][0]['text'];
            
            return [
                'content' => trim($content),
                'tokens' => [
                    'prompt_tokens' => $data['usage']['input_tokens'] ?? 0,
                    'completion_tokens' => $data['usage']['output_tokens'] ?? 0,
                    'total_tokens' => ($data['usage']['input_tokens'] ?? 0) + ($data['usage']['output_tokens'] ?? 0),
                ],
                'model' => $data['model'] ?? $this->model,
                'provider' => 'claude',
            ];

        } catch (Exception $e) {
            Log::error('ClaudeProvider error', [
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
            'streaming' => true,
            'vision' => str_contains($this->model, 'vision'),
            'max_tokens' => 8192,
            'languages' => ['es', 'en', 'ru', 'ja', 'zh', 'ko'],
        ];
    }
}
