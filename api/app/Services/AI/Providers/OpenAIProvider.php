<?php

namespace App\Services\AI\Providers;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\AI\Contracts\AIProviderInterface;

class OpenAIProvider implements AIProviderInterface
{
    protected string $apiKey;
    protected string $model;

    public function __construct(string $apiKey, string $model)
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
    }

    public function getProviderName(): string
    {
        return 'openai';
    }

    public function generate(string $systemPrompt, array $messages, array $options = []): array
    {
        try {
            $formattedMessages = [];

            // Add system prompt
            if (!empty($systemPrompt)) {
                $formattedMessages[] = [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ];
            }

            // Add conversation messages
            foreach ($messages as $msg) {
                $formattedMessages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ];
            }

            $payload = [
                'model' => $this->model,
                'messages' => $formattedMessages,
                'temperature' => $options['temperature'] ?? 0.9,
                'max_tokens' => $options['max_tokens'] ?? 800,
            ];

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.openai.com/v1/chat/completions', $payload);

            if (!$response->successful()) {
                throw new Exception("OpenAI API error: " . $response->body());
            }

            $data = $response->json();

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new Exception("Invalid OpenAI response structure");
            }

            $content = $data['choices'][0]['message']['content'];
            
            return [
                'content' => trim($content),
                'tokens' => [
                    'prompt_tokens' => $data['usage']['prompt_tokens'] ?? 0,
                    'completion_tokens' => $data['usage']['completion_tokens'] ?? 0,
                    'total_tokens' => $data['usage']['total_tokens'] ?? 0,
                ],
                'model' => $data['model'] ?? $this->model,
                'provider' => 'openai',
            ];

        } catch (Exception $e) {
            Log::error('OpenAIProvider error', [
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
            'max_tokens' => 16384,
            'languages' => ['es', 'en', 'ru', 'ja', 'zh', 'ko'],
        ];
    }
}
