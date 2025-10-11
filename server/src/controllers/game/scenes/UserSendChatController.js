const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');
const DirectionEnum = require('../../../enums/DirectionEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');
const UserForcedJoinSceneController = require('./UserForcedJoinSceneController');
const LanguageDetector = require('../../../utils/LanguageDetector');
const MentionExtractor = require('../../../utils/MentionExtractor');
const VisualWidthCalculator = require('../../../utils/VisualWidthCalculator');
const BotApiService = require('../../../services-api/BotApiService');

class UserSendChatController {
    static async main(socket, io, data) {
        try {
            //console.log(`[CHAT-DEBUG] Message received from ${socket.id}: "${data.message}"`);

            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                //console.log(`[CHAT-DEBUG] User not found or not in area`);
                return;
            }

            //console.log(`[CHAT-DEBUG] User ${user.username} in area ${user.currentArea.id}`);

            if (this.#validateIfCommand(user, data)) {
                //console.log(`[CHAT-DEBUG] Message was a command, returning`);
                return;
            }

            if (!user.isActionBlocked(AnimationEnum.CHAT)) {
                UserBlockActionsTask.blockByChat(user);
                const animation = this.getTalkAnimation(user.currentAreaPosition.z);
                if (data.message.length > 60) {
                    data.message = data.message.slice(0, 60);
                }

                // Detect language and calculate visual width
                const detectedLanguage = LanguageDetector.detect(data.message);
                const visualWidth = VisualWidthCalculator.calculate(data.message);

                // Extract mentions
                const mentions = MentionExtractor.extract(data.message);

                ////console.log(`[CHAT] Mentions found: ${JSON.stringify(mentions)}`);

                if (data.recipient) {
                    const recipient = ConnectedUsersCollection.getBySocketId(data.recipient);
                    if (
                        !recipient
                        || !recipient.currentArea
                        || recipient.currentArea.id !== user.currentArea.id
                    ) {
                        return;
                    }
                    socket.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                        'user_socket': user.socket.id,
                        'message': data.message,
                        'username': user.username,
                        'avatarId': user.avatarId,
                        'chat_color': 'private',
                        'animation': !user.isActionBlocked(animation) ? animation : null,
                    });
                    recipient.socket.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                        'user_socket': user.socket.id,
                        'message': data.message,
                        'username': user.username,
                        'avatarId': user.avatarId,
                        'chat_color': 'private',
                        'animation': !user.isActionBlocked(animation) ? animation : null,
                    });
                } else {
                    user.currentArea.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                        'user_socket': user.socket.id,
                        'message': data.message,
                        'username': user.username,
                        'avatarId': user.avatarId,
                        'chat_color': user.chat_color,
                        'animation': !user.isActionBlocked(animation) ? animation : null,
                    });

                    // Process bot mentions
                    //console.log(`[CHAT-DEBUG] Processing bot mentions...`);
                    //console.log(`[CHAT-DEBUG] Mentions found: ${JSON.stringify(mentions)}`);
                    await this.#processBotMentions(user, mentions, data.message, detectedLanguage, visualWidth);
                }
            } else {
                ////console.log(`[CHAT] User ${user.username} is blocked from chat`);
            }

        } catch (err) {
            Log.error('Error in SendEmojiController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }

    /**
     * Process bot mentions and generate responses
     */
    static async #processBotMentions(user, mentions, message, language, visualWidth) {
        //console.log(`[BOT-MENTIONS-DEBUG] Starting processBotMentions`);
        //console.log(`[BOT-MENTIONS-DEBUG] Mentions: ${JSON.stringify(mentions)}`);
        //console.log(`[BOT-MENTIONS-DEBUG] Message: "${message}"`);
        //console.log(`[BOT-MENTIONS-DEBUG] Language: ${language}`);
        
        if (!mentions || mentions.length === 0) {
            //console.log(`[BOT-MENTIONS-DEBUG] No mentions found, returning`);
            return;
        }

        for (const mentionedName of mentions) {
            try {
                //console.log(`[BOT-MENTIONS-DEBUG] Processing mention: ${mentionedName}`);
                
                // Find user in room by username using SceneModel helper
                const mentionedUser = user.currentArea.findUserByUsername(mentionedName);

                //console.log(`[BOT-MENTIONS-DEBUG] Found mentioned user: ${mentionedUser ? mentionedUser.username : 'null'}`);

                if (!mentionedUser) {
                    //console.log(`[BOT-MENTIONS-DEBUG] User ${mentionedName} not found in area`);
                    continue;
                }

                //console.log(`[BOT-MENTIONS-DEBUG] Checking if ${mentionedUser.username} is bot: ${mentionedUser.is_bot}`);

                // Check if mentioned user is a bot
                if (mentionedUser.is_bot !== true) {
                    //console.log(`[BOT-MENTIONS-DEBUG] User ${mentionedName} is not a bot`);
                    continue;
                }

                //console.log(`[BOT-MENTIONS-DEBUG] Bot detected! Starting response pipeline for ${mentionedUser.username}`);

                // Bot detected! Start response pipeline (no room tracking)
                await this.#handleBotResponse(user, mentionedUser, message, language);

            } catch (error) {
                //console.log(`[BOT-MENTIONS-DEBUG] Error processing bot mention for ${mentionedName}: ${error.message}`);
                Log.error(`Error processing bot mention for ${mentionedName}: ${error.message}`);
            }
        }
    }

    /**
     * Handle bot response generation using BotApiService
     */
    static async #handleBotResponse(user, bot, message, language) {
        try {
            //console.log(`[BOT-DEBUG] Starting bot response for ${bot.username} to user ${user.username}`);
            //console.log(`[BOT-DEBUG] Message: "${message}"`);
            //console.log(`[BOT-DEBUG] Language: ${language}`);

            // (1) Check if bot can reply (quota + cooldown)
            const allowResponse = await BotApiService.canReply(bot.id, user.id);

            //console.log(`[BOT-DEBUG] Allow reply response: ${JSON.stringify(allowResponse)}`);

            if (!allowResponse.ok) {
                //console.log(`[BOT-DEBUG] Bot ${bot.username} cannot reply: ${allowResponse.reason}`);
                return;
            }

            //console.log(`[BOT-DEBUG] Bot ${bot.username} can reply, generating response...`);

            // (2) Generate bot response
            const generateResponse = await BotApiService.generateResponse(bot.id, user.id, message, language);

            //console.log(`[BOT-DEBUG] Generate response data: ${JSON.stringify(generateResponse)}`);

            // Check if the response is successful
            if (!generateResponse.success) {
                //console.log(`[BOT-DEBUG] Bot response generation failed: ${generateResponse.error || 'Unknown error'}`);
                return;
            }

            //console.log(`[BOT-DEBUG] ✅ Response generation successful!`);

            const botReply = generateResponse.response;
            const meta = generateResponse.meta;

            //console.log(`[BOT-DEBUG] Bot ${bot.username} responding with ${meta.provider} (${meta.model}): "${botReply}"`);

            // Validate bot object before emission
            //console.log(`[BOT-DEBUG] Validating bot for emission:`);
            //console.log(`[BOT-DEBUG] - bot.socket: ${bot.socket?.id}`);
            //console.log(`[BOT-DEBUG] - bot.username: ${bot.username}`);
            //console.log(`[BOT-DEBUG] - bot.avatarId: ${bot.avatarId}`);
            //console.log(`[BOT-DEBUG] - bot.currentAreaPosition: ${JSON.stringify(bot.currentAreaPosition)}`);
            //console.log(`[BOT-DEBUG] - user.currentArea: ${user.currentArea?.id}`);

            // (3) Split and emit bot response in chunks of max 75 characters
            await this.#sendBotMessageInChunks(user, bot, botReply);

            //console.log(`[BOT-DEBUG] Bot response emitted successfully!`);

        } catch (error) {
            //console.log(`[BOT-DEBUG] Error handling bot response: ${error.message}`);
            //console.log(`[BOT-DEBUG] Stack: ${error.stack}`);
        }
    }

    static #validateIfCommand(user, data) {
        if (data.message.startsWith('/')) {
            const command = data.message.split(' ')[0].substring(1);
            switch (command) {
                case 'show_isomap':
                    user.adminTools.show_isomap = !user.adminTools.show_isomap;
                    return true;
                case 'show_object_reserved_tiles':
                    user.adminTools.show_object_reserved_tiles = !user.adminTools.show_object_reserved_tiles;
                    return true;
                case 'coco':
                    const effect = data.message.split(' ')[1];
                    user.currentArea.emit('response:user_receive_effect',
                        {
                            'user_socket': user.socket.id,
                            'effect': effect,
                        }
                    );
                    return true;
                case 'join':
                    const sceneType = data.message.split(' ')[1];
                    UserForcedJoinSceneController.main(user, sceneType);
                    return true;
            }
            return true;
        }
        return false;
    }

    static getTalkAnimation(direction) {
        switch (direction) {
            case DirectionEnum.DOWN:
                return AnimationEnum.AVATAR_DOWN_TALK;
            case DirectionEnum.DOWN_RIGHT:
                return AnimationEnum.AVATAR_RIGHTDOWN_TALK;
            case DirectionEnum.RIGHT:
                return AnimationEnum.AVATAR_RIGHT_TALK;
            case DirectionEnum.UP_RIGHT:
                return AnimationEnum.AVATAR_RIGHTUP_TALK;
            case DirectionEnum.UP:
                return AnimationEnum.AVATAR_UP_TALK;
            case DirectionEnum.UP_LEFT:
                return AnimationEnum.AVATAR_LEFTUP_TALK;
            case DirectionEnum.LEFT:
                return AnimationEnum.AVATAR_LEFT_TALK;
            case DirectionEnum.DOWN_LEFT:
                return AnimationEnum.AVATAR_LEFTDOWN_TALK;
            default:
                throw new Error('Invalid direction');
        }
    }

    /**
     * Split bot message into chunks of max 75 characters and send them with delay
     */
    static async #sendBotMessageInChunks(user, bot, message) {
        const MAX_CHARS = 75;
        const DELAY_MS = 1500; // 1.5 seconds between messages

        // Calculate mention length
        const mentionPrefix = `@${user.username} `;
        const mentionLength = mentionPrefix.length;
        
        // For the first chunk, we need to reserve space for the mention
        // For subsequent chunks, we can use the full MAX_CHARS
        let chunks = [];
        
        // If the message with mention fits in one chunk
        if ((message.length + mentionLength) <= MAX_CHARS) {
            chunks = [message];
        } else {
            // Split the message considering the mention will be added to first chunk
            const firstChunkMaxChars = MAX_CHARS - mentionLength;
            chunks = this.#splitMessageIntoChunks(message, firstChunkMaxChars, MAX_CHARS);
        }
        
        //console.log(`[BOT-DEBUG] Splitting message into ${chunks.length} chunks with mention:`, chunks);

        for (let i = 0; i < chunks.length; i++) {
            let chunk = chunks[i];
            
            // Add mention only to the first chunk
            if (i === 0) {
                chunk = mentionPrefix + chunk;
            }
            
            const animation = this.getTalkAnimation(bot.currentAreaPosition?.z || DirectionEnum.DOWN);

            //console.log(`[BOT-DEBUG] Sending chunk ${i + 1}/${chunks.length}: "${chunk}" (${chunk.length} chars)`);

            user.currentArea.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                'user_socket': bot.socket.id,
                'message': chunk,
                'username': bot.username,
                'avatarId': bot.avatarId,
                'chat_color': bot.chat_color,
                'animation': !bot.isActionBlocked(animation) ? animation : null,
            });

            // Add delay between chunks (except for the last one)
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }
    }

    /**
     * Split message into chunks respecting word boundaries
     * Supports different max chars for first chunk vs subsequent chunks
     */
    static #splitMessageIntoChunks(message, firstChunkMaxChars, subsequentChunkMaxChars = null) {
        // If no subsequentChunkMaxChars provided, use firstChunkMaxChars for all
        if (subsequentChunkMaxChars === null) {
            subsequentChunkMaxChars = firstChunkMaxChars;
        }

        if (message.length <= firstChunkMaxChars) {
            return [message];
        }

        const chunks = [];
        let currentChunk = '';
        const words = message.split(' ');
        let isFirstChunk = true;

        for (const word of words) {
            const maxChars = isFirstChunk ? firstChunkMaxChars : subsequentChunkMaxChars;
            
            // If adding this word would exceed the limit
            if (currentChunk.length + word.length + 1 > maxChars) {
                // If current chunk is not empty, save it
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                    currentChunk = word;
                    isFirstChunk = false; // No longer the first chunk
                } else {
                    // If word is too long, split it forcefully
                    chunks.push(word.substring(0, maxChars));
                    currentChunk = word.substring(maxChars);
                    isFirstChunk = false;
                }
            } else {
                // Add word to current chunk
                currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
            }
        }

        // Add the last chunk if it's not empty
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}

module.exports = UserSendChatController;