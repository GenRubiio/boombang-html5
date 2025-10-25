<?php

namespace App\Services\AI\Contracts;

interface AIProviderInterface
{
    /**
     * Get provider name
     */
    public function getProviderName(): string;

    /**
     * Generate response from the AI
     * 
     * @param string $systemPrompt System prompt/instructions
     * @param array $messages Conversation history [['role' => 'user', 'content' => '...']]
     * @param array $options Additional options (temperature, max_tokens, etc.)
     * @return array ['content' => 'response text', 'tokens' => [...], 'model' => '...']
     */
    public function generate(string $systemPrompt, array $messages, array $options = []): array;

    /**
     * Check if provider is available
     */
    public function isAvailable(): bool;

    /**
     * Get provider capabilities
     */
    public function getCapabilities(): array;
}
