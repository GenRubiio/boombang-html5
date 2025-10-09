<?php

namespace App\Services;

use Exception;
use App\Models\User;
use App\Models\BotMessage;
use App\Models\BotFact;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\AI\AIProviderManager;

class BotConversationService
{
    protected AIProviderManager $aiManager;

    public function __construct(AIProviderManager $aiManager)
    {
        $this->aiManager = $aiManager;
    }

    /**
     * Check if bot can reply (quota and cooldown)
     */
    public function canReply(int $botId, int $userId): array
    {
        $bot = User::where('is_bot', true)->findOrFail($botId);

        if (!$bot->active) {
            return ['ok' => false, 'reason' => 'Bot is not active'];
        }

        // Check daily quota
        $dailyUsage = $this->getDailyUsage($botId);
        $dailyQuota = $bot->getDailyQuota();

        if ($dailyUsage >= $dailyQuota) {
            return ['ok' => false, 'reason' => 'Daily quota exceeded'];
        }

        // Check cooldown (per bot-user pair)
        $cooldownKey = "bot_cooldown_{$botId}_{$userId}";
        if (Cache::has($cooldownKey)) {
            return ['ok' => false, 'reason' => 'Cooldown active'];
        }

        return ['ok' => true];
    }

    /**
     * Get context for bot response
     */
    public function getContext(int $botId, int $userId): array
    {
        $bot = User::where('is_bot', true)->findOrFail($botId);

        // Get recent messages between this bot and user
        $recentMessages = BotMessage::conversation($botId, $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->values();

        // Get facts
        $facts = BotFact::where('bot_id', $botId)
            ->where('user_id', $userId)
            ->orderBy('confidence', 'desc')
            ->limit(10)
            ->pluck('fact')
            ->toArray();

        return [
            'bot' => $bot,
            'recent_messages' => $recentMessages,
            'facts' => $facts,
        ];
    }

    /**
     * Generate bot response
     */
    public function generateResponse(
        int $botId,
        int $userId,
        string $userMessage,
        string $detectedLanguage
    ): array {
        $context = $this->getContext($botId, $userId);
        $bot = $context['bot'];

        $systemPrompt = $this->buildSystemPrompt($bot, $context, $detectedLanguage);
        $messages = $this->buildMessages($context['recent_messages'], $userMessage);

        try {
            $aiResponse = $this->aiManager->generateWithFallback(
                $systemPrompt,
                $messages,
                [
                    'temperature' => 0.9,
                    'max_tokens' => 800,
                ]
            );

            $responseText = $aiResponse['content'];

            // Save messages (NO room_id)
            $this->saveMessage('user', $userId, $userMessage, $detectedLanguage);
            $this->saveMessage('bot', $botId, $responseText, $detectedLanguage, [
                'provider' => $aiResponse['provider'],
                'model' => $aiResponse['model'],
                'tokens' => $aiResponse['tokens'],
            ]);

            // Increment usage and set cooldown
            $this->incrementDailyUsage($botId);
            $this->setCooldown($botId, $userId, $bot->getCooldownSeconds());

            return [
                'success' => true,
                'response' => $responseText,
                'meta' => [
                    'provider' => $aiResponse['provider'],
                    'model' => $aiResponse['model'],
                    'tokens' => $aiResponse['tokens'],
                    'language' => $detectedLanguage,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Bot response generation failed', [
                'bot_id' => $botId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function buildSystemPrompt(User $bot, array $context, string $language): string
    {
        $prompt = $bot->bot_system_prompt;

        // Only add language instruction if not already specified in bot prompt
        if (!str_contains($bot->bot_system_prompt, 'idioma') && !str_contains($bot->bot_system_prompt, 'language')) {
            $languageNames = [
                'es' => 'español',
                'en' => 'English',
                'ru' => 'русский',
                'ja' => '日本語',
                'zh' => '中文',
                'ko' => '한국어',
            ];
            $langName = $languageNames[$language] ?? 'the same language as the user';
            $prompt .= "\n\nResponde en {$langName}.";
        }

        if (!empty($context['facts'])) {
            $prompt .= "\n\nKNOWN FACTS:\n";
            foreach ($context['facts'] as $fact) {
                $prompt .= "- {$fact}\n";
            }
        }

        return $prompt;
    }

    protected function buildMessages(object $recentMessages, string $currentMessage): array
    {
        $messages = [];

        foreach ($recentMessages as $msg) {
            $role = $msg->sender_type === 'bot' ? 'assistant' : 'user';
            $messages[] = [
                'role' => $role,
                'content' => $msg->content,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $currentMessage,
        ];

        return $messages;
    }

    protected function saveMessage(
        string $senderType,
        int $senderId,
        string $content,
        string $language = null,
        array $metadata = []
    ): BotMessage {
        return BotMessage::create([
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'content' => $content,
            'language' => $language,
            'metadata' => $metadata,
        ]);
    }

    protected function getDailyUsage(int $botId): int
    {
        $dayKey = now()->format('Ymd');
        $usageKey = "bot_daily_usage_{$botId}_{$dayKey}";
        return (int) Cache::get($usageKey, 0);
    }

    protected function incrementDailyUsage(int $botId): void
    {
        $dayKey = now()->format('Ymd');
        $usageKey = "bot_daily_usage_{$botId}_{$dayKey}";
        $current = (int) Cache::get($usageKey, 0);
        Cache::put($usageKey, $current + 1, now()->endOfDay());
    }

    protected function setCooldown(int $botId, int $userId, int $seconds): void
    {
        $cooldownKey = "bot_cooldown_{$botId}_{$userId}";
        Cache::put($cooldownKey, true, $seconds);
    }

    public function consumeQuota(int $botId): void
    {
        $this->incrementDailyUsage($botId);
    }
}
