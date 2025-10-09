# 🤖 Bot System - Final Implementation

## ✅ Architecture Decision

**Los bots SON usuarios normales** con `is_bot=1` en la tabla `users`. No hay tabla separada de `bots`.

### Razón:
- Los bots se comportan como usuarios normales
- Entran y salen de salas
- Cambian de sala libremente
- No acceden por contraseña pero sí por login
- Simulan totalmente las acciones de personas reales

## 📊 Database Structure

### `users` table (campos bot agregados):
```sql
- is_bot: boolean (indica si es un bot)
- bot_system_prompt: text (personalidad e instrucciones del bot)
- bot_language_mode: enum (auto, es, en, ru, ja, zh, ko)
- bot_settings: json ({"daily_quota": 300, "cooldown_sec": 2})
```

### `bot_messages` table:
```sql
- sender_type: enum('bot', 'user')
- sender_id: bigint (id del usuario, bot o normal)
- content: text
- language: string
- metadata: json
- room_id: bigint NULLABLE (no se trackea en API)
```

### `bot_facts` table:
```sql
- bot_id: bigint (foreign key a users.id donde is_bot=1)
- user_id: bigint (foreign key a users.id)
- fact: text
- confidence: float
- source: string
```

### `api_keys` table:
```sql
- type: enum('gemini_api_key', 'openai_api_key', 'claude_api_key')
- key_value: string (encrypted)
- active: boolean
- description: string
```

## 🔧 Models

### User.php (extendido para bots)

**Fillable fields agregados:**
```php
'is_bot',
'bot_system_prompt',
'bot_language_mode',
'bot_settings',
```

**Scopes:**
```php
User::bots()->get()           // Solo bots
User::activeBots()->get()     // Solo bots activos
```

**Helper methods:**
```php
$user->getDailyQuota()        // Retorna daily_quota del bot_settings
$user->getCooldownSeconds()   // Retorna cooldown_sec del bot_settings
```

## 🎯 Services

### BotConversationService

**Responsabilidades:**
- Validar si el bot puede responder (quota + cooldown)
- Obtener contexto de conversación (bot-usuario)
- Generar respuestas usando AI providers
- Guardar mensajes en `bot_messages`
- Gestionar cooldowns y quotas usando **Laravel Cache** (no Redis)

**Key methods:**
```php
canReply(int $botId, int $userId): array
getContext(int $botId, int $userId): array
generateResponse(int $botId, int $userId, string $userMessage, string $detectedLanguage): array
```

**Nota importante:** Ya NO se pasa `$roomId` porque las salas son efímeras (manejadas por el emulador Node.js).

### AIProviderManager

**Responsabilidades:**
- Seleccionar provider disponible (Gemini, OpenAI, Claude)
- Load balancing entre API keys
- Fallback automático si un provider falla
- Tracking de uso de API keys

**Providers soportados:**
- Google Gemini (`gemini-1.5-flash`)
- OpenAI (`gpt-4o-mini`)
- Anthropic Claude (`claude-3-5-sonnet`)

## 🌐 API Endpoints

Todos bajo middleware `VerifyEmulatorToken`:

### GET /api/bots
Lista todos los bots activos
```json
{
  "bots": [
    {"id": 1, "username": "SenseiAI", "is_bot": true, ...}
  ]
}
```

### POST /api/bot/allow-reply
Valida si el bot puede responder (quota + cooldown)
```json
Request:
{
  "bot_id": 1,
  "user_id": 5
}

Response:
{
  "ok": true
}
```

### POST /api/bot/context
Obtiene contexto de conversación
```json
Request:
{
  "bot_id": 1,
  "user_id": 5
}

Response:
{
  "bot": {...},
  "recent_messages": [...],
  "facts": [...]
}
```

### POST /api/bot/generate
Genera respuesta del bot
```json
Request:
{
  "bot_id": 1,
  "user_id": 5,
  "message": "Hola, ¿cómo estás?",
  "language": "es"
}

Response:
{
  "response": "¡Hola! Estoy muy bien, ¿en qué puedo ayudarte?",
  "provider": "gemini",
  "usage": {...}
}
```

### POST /api/bot/consume-quota
Incrementa el uso diario del bot
```json
Request:
{
  "bot_id": 1
}
```

### GET /api/bot/ai-provider-stats
Estadísticas de uso de providers
```json
Response:
{
  "stats": [
    {"id": 1, "type": "gemini_api_key", "usage_today": 45},
    {"id": 2, "type": "openai_api_key", "usage_today": 23}
  ]
}
```

## 🎮 Node.js Integration

### UserSendChatController.js

**Flujo cuando un usuario menciona un bot:**

1. Usuario envía: `"@SenseiAI hola"`
2. `MentionExtractor` detecta `@SenseiAI`
3. `SceneModel.findUserByUsername('SenseiAI')` busca el bot en la sala
4. `LanguageDetector.detect('hola')` → `'es'`
5. **Validación:** `POST /api/bot/allow-reply` → `{ok: true}`
6. **Generación:** `POST /api/bot/generate` → `{response: "..."}`
7. Bot responde en la sala como un usuario normal

**Utilities creadas:**
- `LanguageDetector.js` - Detecta idioma del mensaje (es, en, ru, ja, zh, ko)
- `MentionExtractor.js` - Extrae menciones @username
- `VisualWidthCalculator.js` - Calcula ancho visual del texto

## 🔐 Cache System (sin Redis)

Laravel Cache usa **file driver** por defecto:

### Quota tracking:
```php
Cache::get("bot_daily_usage_{botId}_{dayKey}", 0)
Cache::put("bot_daily_usage_{botId}_{dayKey}", $count, now()->endOfDay())
```

### Cooldown tracking:
```php
Cache::put("bot_cooldown_{botId}_{userId}", true, $seconds)
Cache::has("bot_cooldown_{botId}_{userId}")
```

### API Key usage:
```php
Cache::get("api_key_usage_{keyId}_{dayKey}", 0)
Cache::put("api_key_usage_{keyId}_{dayKey}", $count, now()->endOfDay())
```

## 🌱 Seeders

### BotUserSeeder
Crea 3 usuarios bot de ejemplo:
- **SenseiAI** - Maestro de artes marciales (quota: 500/día)
- **GameMaster** - Anfitrión de eventos (quota: 300/día)
- **TechHelper** - Asistente técnico (quota: 400/día)

### ApiKeySeeder
Crea 3 API keys de ejemplo (FAKE - reemplazar con reales):
- Gemini API key
- OpenAI API key  
- Claude API key

## 📝 Testing

### 1. Verificar bots creados:
```sql
SELECT id, username, name, is_bot, bot_system_prompt 
FROM users 
WHERE is_bot = 1;
```

### 2. Agregar API key real:
```sql
UPDATE api_keys 
SET key_value = 'tu-api-key-real', active = 1 
WHERE type = 'gemini_api_key';
```

### 3. Test en el juego:
1. Usuario entra a una sala
2. Usuario escribe: `@SenseiAI hola`
3. Bot debe responder en español

### 4. Ver logs:
```bash
tail -f api/storage/logs/laravel.log
```

## ✨ Features

✅ **Multi-provider AI** - Gemini, OpenAI, Claude
✅ **Load balancing** - Distribuye uso entre API keys
✅ **Fallback automático** - Si un provider falla, usa otro
✅ **Detección de idioma** - Responde en el idioma detectado
✅ **Quota diaria** - Límite de mensajes por día por bot
✅ **Cooldown** - Tiempo entre respuestas por bot-usuario
✅ **Conversación contextual** - Recuerda últimos 10 mensajes
✅ **Facts system** - Aprende datos del usuario
✅ **Sin Redis** - Usa cache de archivos de Laravel
✅ **Bots como usuarios** - Se comportan exactamente como jugadores

## 🚀 Next Steps

1. ✅ Migrar database
2. ✅ Seed bots y API keys
3. ⏳ Agregar API keys reales en DB
4. ⏳ Test en juego
5. ⏳ Ajustar system prompts según comportamiento deseado
6. ⏳ Monitorear quotas y ajustar límites
