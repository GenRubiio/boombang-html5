/**
 * Bot System Configuration
 * Configuration for the multi-provider AI bot system
 */

module.exports = {
    // API configuration
    api: {
        baseUrl: process.env.API_URL || 'http://localhost:8000/api',
        timeout: 30000, // 30 seconds
    },

    // Chat limits
    chat: {
        maxMessageLength: 60, // Characters
        maxVisualWidth: 4000, // Pixels (approximate)
    },

    // Default bot settings (can be overridden per bot in database)
    defaults: {
        dailyQuota: 300,
        cooldownSeconds: 2,
        languageMode: 'auto', // auto, es, en, ru, ja, zh, ko
    },

    // Language detection configuration
    language: {
        default: 'en',
        supported: ['es', 'en', 'ru', 'ja', 'zh', 'ko'],
    },

    // Visual width calculation
    visualWidth: {
        fontSize: 14, // Base font size for calculations
        maxWidth: 4000, // Maximum allowed width in pixels
    },

    // Logging
    logging: {
        enabled: true,
        logBotResponses: true,
        logProviderSelection: true,
    },
};
