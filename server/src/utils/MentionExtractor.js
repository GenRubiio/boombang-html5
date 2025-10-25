/**
 * Mention Extractor Utility
 * Extracts @mentions from chat messages
 */

class MentionExtractor {
    /**
     * Extract all @mentions from a message
     * @param {string} message - Message text
     * @returns {string[]} Array of mentioned usernames (without @)
     */
    static extract(message) {
        if (!message || typeof message !== 'string') {
            return [];
        }

        // Match @username pattern (letters, numbers, underscore)
        const mentionPattern = /@(\w+)/g;
        const mentions = [];
        let match;

        while ((match = mentionPattern.exec(message)) !== null) {
            const username = match[1];
            if (!mentions.includes(username)) {
                mentions.push(username);
            }
        }

        return mentions;
    }

    /**
     * Check if a message mentions a specific username
     * @param {string} message - Message text
     * @param {string} username - Username to check
     * @returns {boolean}
     */
    static isMentioned(message, username) {
        if (!message || !username) return false;
        const pattern = new RegExp(`@${username}\\b`, 'i');
        return pattern.test(message);
    }

    /**
     * Remove mentions from a message
     * @param {string} message - Message text
     * @returns {string} Message without mentions
     */
    static removeMentions(message) {
        if (!message) return '';
        return message.replace(/@\w+/g, '').trim();
    }

    /**
     * Replace mentions with display names
     * @param {string} message - Message text
     * @param {Map<string, string>} userMap - Map of username -> display name
     * @returns {string} Message with formatted mentions
     */
    static formatMentions(message, userMap) {
        if (!message) return '';
        
        return message.replace(/@(\w+)/g, (match, username) => {
            const displayName = userMap.get(username);
            return displayName ? `@${displayName}` : match;
        });
    }
}

module.exports = MentionExtractor;
