<?php

namespace App\Services\AI;

use Exception;
use App\Models\ApiKey;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\AI\Contracts\AIProviderInterface;
use App\Services\AI\Providers\GeminiProvider;
use App\Services\AI\Providers\OpenAIProvider;
use App\Services\AI\Providers\ClaudeProvider;

class AIProviderManager
{
    protected array $providerMap = [
        'gemini_api_key' => GeminiProvider::class,
        'openai_api_key' => OpenAIProvider::class,
        'claude_api_key' => ClaudeProvider::class,
    ];

    protected array $defaultModels = [
        'gemini_api_key' => 'gemini-2.5-flash',
        'openai_api_key' => 'gpt-4o-mini',
        'claude_api_key' => 'claude-3-5-sonnet-20241022',
    ];

    /**
     * Get a random available provider with load balancing
     * 
     * @param array $preferredTypes Preferred provider types (e.g., ['gemini_api_key', 'openai_api_key'])
     * @return AIProviderInterface
     * @throws Exception
     */
    public function getProvider(array $preferredTypes = []): AIProviderInterface
    {
        // If no preferences, use all available types
        if (empty($preferredTypes)) {
            $preferredTypes = array_keys($this->providerMap);
        }

        // Get all active keys for preferred types
        $availableKeys = ApiKey::whereIn('type', $preferredTypes)
            ->where('active', true)
            ->get();

        if ($availableKeys->isEmpty()) {
            throw new Exception('No active API keys available for AI providers');
        }

        // Select key with load balancing (random weighted by usage)
        $selectedKey = $this->selectKeyWithBalancing($availableKeys);

        // Increment usage counter
        $this->incrementKeyUsage($selectedKey);

        // Create provider instance
        return $this->createProvider($selectedKey);
    }

    /**
     * Get a specific provider by API key ID
     */
    public function getProviderByKeyId(int $keyId): AIProviderInterface
    {
        $apiKey = ApiKey::where('id', $keyId)
            ->where('active', true)
            ->firstOrFail();

        $this->incrementKeyUsage($apiKey);

        return $this->createProvider($apiKey);
    }

    /**
     * Generate response with automatic fallback
     * 
     * @param string $systemPrompt System instructions
     * @param array $messages Conversation history
     * @param array $options Generation options
     * @param array $preferredTypes Preferred provider types
     * @return array Response with metadata
     */
    public function generateWithFallback(
        string $systemPrompt,
        array $messages,
        array $options = [],
        array $preferredTypes = []
    ): array {
        $attempts = 0;
        $maxAttempts = 3;
        $lastException = null;

        while ($attempts < $maxAttempts) {
            try {
                $provider = $this->getProvider($preferredTypes);
                
                $result = $provider->generate($systemPrompt, $messages, $options);
                
                // Add metadata about which provider was used
                $result['attempts'] = $attempts + 1;
                
                return $result;

            } catch (Exception $e) {
                $lastException = $e;
                $attempts++;
                
                Log::warning('AI Provider attempt failed', [
                    'attempt' => $attempts,
                    'error' => $e->getMessage(),
                ]);

                if ($attempts < $maxAttempts) {
                    // Wait a bit before retrying
                    usleep(500000); // 0.5 seconds
                }
            }
        }

        throw new Exception(
            "All AI provider attempts failed. Last error: " . $lastException->getMessage()
        );
    }

    /**
     * Select API key with load balancing
     * Uses Laravel cache instead of Redis
     */
    protected function selectKeyWithBalancing($keys): ApiKey
    {
        if ($keys->count() === 1) {
            return $keys->first();
        }

        $dayKey = now()->format('Ymd');
        $usageData = [];

        // Get usage for each key
        foreach ($keys as $key) {
            $usageKey = $this->getUsageKey($key, $dayKey);
            $usage = (int) Cache::get($usageKey, 0);
            $usageData[$key->id] = $usage;
        }

        // Select key with lowest usage (weighted random)
        $minUsage = min($usageData);
        $candidates = $keys->filter(function ($key) use ($usageData, $minUsage) {
            return $usageData[$key->id] <= $minUsage + 10; // Allow small variance
        });

        return $candidates->random();
    }

    /**
     * Increment key usage counter
     */
    protected function incrementKeyUsage(ApiKey $apiKey): void
    {
        $dayKey = now()->format('Ymd');
        $usageKey = $this->getUsageKey($apiKey, $dayKey);
        $current = (int) Cache::get($usageKey, 0);
        Cache::put($usageKey, $current + 1, now()->endOfDay());
    }

    /**
     * Get usage statistics for all active keys
     */
    public function getUsageStats(): array
    {
        $dayKey = now()->format('Ymd');
        $keys = ApiKey::where('active', true)->get();
        $stats = [];

        foreach ($keys as $key) {
            $usageKey = $this->getUsageKey($key, $dayKey);
            $stats[] = [
                'id' => $key->id,
                'type' => $key->type,
                'description' => $key->description,
                'usage_today' => (int) Cache::get($usageKey, 0),
            ];
        }

        return $stats;
    }

    /**
     * Create provider instance from API key
     */
    protected function createProvider(ApiKey $apiKey): AIProviderInterface
    {
        $providerClass = $this->providerMap[$apiKey->type] ?? null;

        if (!$providerClass) {
            throw new Exception("Unknown provider type: {$apiKey->type}");
        }

        $model = $this->defaultModels[$apiKey->type] ?? null;

        // Use decrypted key (API keys are encrypted in database)
        return new $providerClass($apiKey->decrypted_key, $model);
    }

    /**
     * Get Redis key for usage tracking
     */
    protected function getUsageKey(ApiKey $apiKey, string $dayKey): string
    {
        return "ai:key_usage:{$apiKey->type}:{$apiKey->id}:{$dayKey}";
    }
}
