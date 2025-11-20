<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyEmulatorToken;
use App\Http\Controllers\Internal\BotController;
use App\Http\Controllers\Internal\ShopController;
use App\Http\Controllers\Api\Auth\LoginApiController;
use App\Http\Controllers\Api\Auth\LogoutApiController;
use App\Http\Controllers\Api\Bot\BotContextController;
use App\Http\Controllers\Internal\InventoryController;
use App\Http\Controllers\Api\Bot\BotMessagesController;
use App\Http\Controllers\Api\Auth\BotLoginApiController;
use App\Http\Controllers\Api\Auth\RegisterApiController;
use App\Http\Controllers\Api\Game\MinigameApiController;
use App\Http\Controllers\Api\Bot\BotAllowReplyController;
use App\Http\Controllers\Api\Bot\BotCacheClearController;
use App\Http\Controllers\Api\Game\Lobby\MailApiController;
use App\Http\Controllers\Api\Auth\LoginGoogleApiController;
use App\Http\Controllers\Api\Bot\AIProviderStatsController;
use App\Http\Controllers\Api\Bot\BotConsumeQuotaController;
use App\Http\Controllers\Api\Game\Scene\IslandApiController;
use App\Http\Controllers\Api\User\IncreaseStatsApiController;
use App\Http\Controllers\Api\User\UserChangeAvatarController;
use App\Http\Controllers\Api\Game\Lobby\GachaponApiController;
use App\Http\Controllers\Api\User\UserChangeChatApiController;
use App\Http\Controllers\Api\Bot\BotGenerateResponseController;
use App\Http\Controllers\Api\Game\Scene\GameSceneApiController;
use App\Http\Controllers\Api\User\UserChangeFichaApiController;
use App\Http\Controllers\Api\Auth\GetBotByUsernameApiController;
use App\Http\Controllers\Api\Game\Scene\PublicSceneApiController;
use App\Http\Controllers\Api\User\UpdateDescriptionApiController;
use App\Http\Controllers\Api\Game\Npc\NpcCatalogItemApiController;
use App\Http\Controllers\Api\Game\Scene\PrivateSceneApiController;
use App\Http\Controllers\Api\User\UserChangeShadowColorController;
use App\Http\Controllers\Api\Game\Object\RotateObjectApiController;
use App\Http\Controllers\Api\Game\Scene\MinigameSceneApiController;
use App\Http\Controllers\Api\User\UserChangeColornameApiController;
use App\Http\Controllers\Api\Game\Config\IslandsConfigApiController;
use App\Http\Controllers\Api\Game\Lobby\SettingsUpdateApiController;
use App\Http\Controllers\Api\Game\Scene\SceneUserAvatarsApiController;
use App\Http\Controllers\Api\Game\Config\PrivateSceneConfigApiController;
use App\Http\Controllers\Api\Game\Scene\SceneUserDecorationsApiController;

Route::prefix('test')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
    });
});

Route::middleware(VerifyEmulatorToken::class)->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [LoginApiController::class, 'login']);
        Route::post('google', [LoginGoogleApiController::class, 'login']);
        Route::post('register', [RegisterApiController::class, 'register']);
        Route::post('bot-login', [BotLoginApiController::class, 'login']);
        Route::post('get-bot-by-username', [GetBotByUsernameApiController::class, 'getBotByUsername']);
    });

    /**
     * Boot Emulator API Routes
     */
    Route::prefix('public-scene')->group(function () {
        Route::post('get', [PublicSceneApiController::class, 'get']);
    });

    Route::prefix('game-scene')->group(function () {
        Route::post('get', [GameSceneApiController::class, 'get']);
    });

    Route::prefix('minigame-scene')->group(function () {
        Route::post('get', [MinigameSceneApiController::class, 'get']);
    });

    /**
     * Game API Routes
     */
    Route::middleware(['auth:api'])->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('jwt-auto-login', [LoginApiController::class, 'jwtAutoLogin']);
            Route::post('logout', [LogoutApiController::class, 'index']);
        });

        Route::prefix('user')->group(function () {
            Route::post('increase-stats', [IncreaseStatsApiController::class, 'index']);
            Route::post('update-description', [UpdateDescriptionApiController::class, 'index']);
            Route::post('change-ficha', [UserChangeFichaApiController::class, 'index']);
            Route::post('change-chat', [UserChangeChatApiController::class, 'index']);
            Route::post('change-colorname', [UserChangeColornameApiController::class, 'index']);
            Route::post('change-shadowcolor', [UserChangeShadowColorController::class, 'index']);
            Route::post('change-avatar', [UserChangeAvatarController::class, 'index']);
        });

        Route::prefix('lobby')->group(function () {
            Route::prefix('gachapon')->group(function () {
                Route::post('spin', [GachaponApiController::class, 'spin']);
                Route::post('prizes', [GachaponApiController::class, 'prizes']);
            });
            Route::prefix('settings')->group(function () {
                Route::post('update-name', [SettingsUpdateApiController::class, 'updateName']);
                Route::post('update-lang', [SettingsUpdateApiController::class, 'updateLang']);
                Route::post('update-graphics', [SettingsUpdateApiController::class, 'updateGraphics']);
                Route::post('update-sounds', [SettingsUpdateApiController::class, 'updateSounds']);
            });
            Route::prefix('mail')->group(function () {
                Route::post('inbox', [MailApiController::class, 'getInbox']);
                Route::post('read', [MailApiController::class, 'markAsRead']);
                Route::post('claim', [MailApiController::class, 'claimReward']);
                Route::post('unread-count', [MailApiController::class, 'getUnreadCount']);
            });
        });

        Route::prefix('object')->group(function () {
            Route::post('rotate', [RotateObjectApiController::class, 'index']);
        });

        Route::prefix('island')->group(function () {
            Route::post('/', [IslandApiController::class, 'index']);
            Route::post('create', [IslandApiController::class, 'create']);
            Route::post('join', [IslandApiController::class, 'join']);
            Route::post('update-name', [IslandApiController::class, 'updateName']);
            Route::post('update-description', [IslandApiController::class, 'updateDescription']);
            Route::post('delete', [IslandApiController::class, 'delete']);
        });

        Route::prefix('islands')->group(function () {
            Route::post('get', [IslandApiController::class, 'getMyIslands']);
            Route::post('search', [IslandApiController::class, 'search']);
        });

        Route::prefix('private-scene')->group(function () {
            Route::post('create', [PrivateSceneApiController::class, 'create']);
            Route::post('join', [PrivateSceneApiController::class, 'join']);
            Route::post('remove-item', [PrivateSceneApiController::class, 'removeItem']);
            Route::post('put-item', [PrivateSceneApiController::class, 'putItem']);
            Route::post('update-item-position', [PrivateSceneApiController::class, 'updateItemPosition']);
            Route::post('update-name', [PrivateSceneApiController::class, 'updateName']);
            Route::post('update-colors', [PrivateSceneApiController::class, 'updateColors']);
            Route::post('delete', [PrivateSceneApiController::class, 'delete']);
        });

        Route::prefix('public-scene')->group(function () {
            Route::post('user-catch-item', [PublicSceneApiController::class, 'userCatchItem']);
        });

        Route::prefix('scene')->group(function () {
            Route::post('user-decorations', [SceneUserDecorationsApiController::class, 'index']);
            Route::post('user-avatars', [SceneUserAvatarsApiController::class, 'index']);
        });

        Route::prefix('catalog')->group(function () {
            Route::post('lobby-gachapon', [GachaponApiController::class, 'get']);
        });

        Route::prefix('minigames')->group(function () {
            Route::post('/', [MinigameApiController::class, 'index']);
            Route::post('ranking', [MinigameApiController::class, 'getRanking']);
        });

        Route::prefix('npc')->group(function () {
            Route::post('catalog-items', [NpcCatalogItemApiController::class, 'getNpcCatalogItems']);
            Route::post('check-requirements', [NpcCatalogItemApiController::class, 'checkRequirements']);
            Route::post('claim-item', [NpcCatalogItemApiController::class, 'claimItem']);
        });

        Route::prefix('islands-config')->group(function () {
            Route::post('/', [IslandsConfigApiController::class, 'index']);
            Route::post('{id}', [IslandsConfigApiController::class, 'show']);
        });

        Route::prefix('private-scene-config')->group(function () {
            Route::post('/', [PrivateSceneConfigApiController::class, 'index']);
            Route::post('{id}', [PrivateSceneConfigApiController::class, 'show']);
            Route::post('by-island/{islandConfigId}', [PrivateSceneConfigApiController::class, 'getByIsland']);
        });

        Route::prefix('inventory')->group(function () {
            Route::post('get-user-inventory', [InventoryController::class, 'getUserInventory']);
        });

        Route::prefix('shop')->group(function () {
            Route::post('catalog', [ShopController::class, 'getCatalog']);
            Route::post('purchase', [ShopController::class, 'purchaseItem']);
        });
    });
});

Route::prefix('internal')->group(function () {
    Route::prefix('bots')->group(function () {
        Route::post('generate-token', [BotController::class, 'generateToken']);
    });
});

/**
 * Bot Conversation System Routes
 */
Route::middleware(VerifyEmulatorToken::class)->prefix('bot')->group(function () {
    // Check if bot can reply (quota + cooldown)
    Route::post('allow-reply', [BotAllowReplyController::class, 'allowReply']);
    
    // Get context for bot response
    Route::get('context', [BotContextController::class, 'getContext']);
    
    // Generate bot response
    Route::post('generate', [BotGenerateResponseController::class, 'generate']);
    
    // Consume bot quota
    Route::post('consume', [BotConsumeQuotaController::class, 'consume']);
    
    // Clear bot cache
    Route::post('clear-cache', [BotCacheClearController::class, 'clearCache']);
    Route::post('clear-all-cache', [BotCacheClearController::class, 'clearAllCache']);
    
    // Save/get messages
    Route::post('messages', [BotMessagesController::class, 'store']);
    Route::get('messages', [BotMessagesController::class, 'index']);
    
    // AI Provider statistics
    Route::get('ai/stats', [AIProviderStatsController::class, 'stats']);
});
