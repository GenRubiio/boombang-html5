# 🤖 Sistema Multi-Provider de Bots Conversacionales

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Usuario)                        │
│                    Envía: "@BotName mensaje"                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   NODE.JS (Servidor de Juego)                    │
│  UserSendChatController.js                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Detecta idioma (LanguageDetector)                     │   │
│  │ 2. Extrae menciones (MentionExtractor)                   │   │
│  │ 3. Calcula ancho visual (VisualWidthCalculator)          │   │
│  │ 4. Busca usuario mencionado en sala                       │   │
│  │ 5. Verifica si es bot (is_bot === true)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LARAVEL API (Backend)                         │
│                                                                  │
│  POST /api/bot/allow-reply                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Verifica cuota diaria (Redis)                          │   │
│  │ • Verifica cooldown (Redis)                              │   │
│  │ • Retorna: { ok: true/false, reason: ... }               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ↓                                    │
│  POST /api/bot/generate                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ BotConversationService                                    │   │
│  │ ├─ Obtiene contexto (resumen + hechos + mensajes)        │   │
│  │ ├─ Construye system prompt                               │   │
│  │ └─ Llama a AIProviderManager                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ↓                                    │
│  AIProviderManager                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Obtiene API keys activas del tipo preferido           │   │
│  │ 2. Selecciona key con balanceo (menor uso)               │   │
│  │ 3. Crea provider (Gemini/OpenAI/Claude)                  │   │
│  │ 4. Intenta generar respuesta                             │   │
│  │ 5. Si falla → prueba con otro provider (fallback)        │   │
│  │ 6. Incrementa contador de uso (Redis)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PROVEEDORES DE IA                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Gemini     │  │   OpenAI     │  │   Claude     │          │
│  │   (Google)   │  │     (GPT)    │  │ (Anthropic)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                  ↓                  ↓                  │
│  Respuesta en el mismo idioma del usuario                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   LARAVEL API (Backend)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Guarda mensaje del bot (BotMessage)                    │   │
│  │ • Actualiza métricas (tokens, provider usado)            │   │
│  │ • Incrementa cuota diaria                                │   │
│  │ • Establece cooldown                                     │   │
│  │ • Retorna: { response, meta: { provider, tokens } }      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   NODE.JS (Servidor de Juego)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Emite respuesta del bot a toda la sala                 │   │
│  │ • Formato: ResponseSocketsEnum.USER_SEND_CHAT            │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Todos los usuarios)                  │
│              Reciben mensaje del bot en tiempo real              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Selección de Provider con Fallback

```
AIProviderManager.generateWithFallback()
    │
    ├─ Intento 1
    │   ├─ Obtener providers disponibles: [gemini_api_key, openai_api_key, claude_api_key]
    │   ├─ Consultar uso en Redis
    │   │   gemini_key_1: 45 usos hoy
    │   │   gemini_key_2: 38 usos hoy
    │   │   openai_key_1: 12 usos hoy
    │   │
    │   ├─ Seleccionar key con menor uso → openai_key_1
    │   ├─ Crear OpenAIProvider
    │   ├─ Llamar a generate()
    │   │
    │   └─ ✅ ÉXITO → Retorna respuesta
    │       {
    │         content: "¡Hola! ¿En qué puedo ayudarte?",
    │         provider: "openai",
    │         model: "gpt-4o-mini",
    │         tokens: { prompt: 120, completion: 35, total: 155 },
    │         attempts: 1
    │       }
    │
    │   └─ ❌ ERROR (API caída, cuota excedida, etc.)
    │       ↓
    │       Intento 2
    │       ├─ Seleccionar otra key → gemini_key_2
    │       ├─ Crear GeminiProvider
    │       ├─ Llamar a generate()
    │       │
    │       └─ ✅ ÉXITO → Retorna respuesta
    │           {
    │             content: "¡Hola! ¿En qué puedo ayudarte?",
    │             provider: "gemini",
    │             model: "gemini-1.5-flash",
    │             tokens: { prompt: 115, completion: 32, total: 147 },
    │             attempts: 2
    │           }
    │
    │       └─ ❌ ERROR
    │           ↓
    │           Intento 3
    │           ├─ Seleccionar otra key → claude_key_1
    │           ├─ Crear ClaudeProvider
    │           ├─ Llamar a generate()
    │           │
    │           └─ ✅ ÉXITO → Retorna respuesta
    │           │
    │           └─ ❌ ERROR
    │               ↓
    │               Lanza Exception: "All AI provider attempts failed"
```

## 🎯 Balanceo de Carga entre API Keys

```
Redis Keys (por día):
┌─────────────────────────────────────────────────────┐
│ ai:key_usage:gemini_api_key:1:20251007 = 45        │
│ ai:key_usage:gemini_api_key:2:20251007 = 38        │
│ ai:key_usage:openai_api_key:3:20251007 = 12        │
│ ai:key_usage:claude_api_key:4:20251007 = 0         │
└─────────────────────────────────────────────────────┘

Selección:
1. Obtener todas las keys activas del tipo solicitado
2. Consultar uso actual en Redis
3. Seleccionar la key con menor uso (± 10 para variación)
4. Incrementar contador
5. Establecer TTL al final del día
```

## 📦 Estructura de Base de Datos

```sql
-- Bots conversacionales
bots
├── id
├── name                (usado para menciones @name)
├── system_prompt       (personalidad del bot)
├── language_mode       (auto, es, en, ru, ja, zh, ko)
├── settings            (JSON: daily_quota, cooldown_sec)
└── active

-- Mensajes del chat (usuarios y bots)
bot_messages
├── id
├── room_id
├── thread_id           (opcional, para conversaciones)
├── sender_type         (user, bot)
├── sender_id           (user_id o bot_id)
├── content
├── meta                (JSON: lang, provider, tokens)
└── created_at

-- Resúmenes de conversación
bot_summaries
├── id
├── room_id
├── bot_id
├── summary             (resumen compacto)
├── last_message_id
└── updated_at

-- Hechos persistentes sobre usuarios
bot_facts
├── id
├── user_id
├── bot_id
├── fact                (preferencias, datos importantes)
├── confidence          (0-100)
├── source              (extracted, manual)
└── created_at

-- API Keys multi-provider
api_keys
├── id
├── user_id             (opcional)
├── key                 (clave API real)
├── type                (gemini_api_key, openai_api_key, claude_api_key)
├── description
├── active
└── created_at
```

## 🚀 Ejemplo de Uso Completo

```javascript
// 1. Usuario envía mensaje
const message = "Hola @SenseiAI, ¿me ayudas con estrategia?";

// 2. Node.js procesa
const language = LanguageDetector.detect(message); // 'es'
const mentions = MentionExtractor.extract(message); // ['SenseiAI']
const visualWidth = VisualWidthCalculator.calculate(message); // 342px

// 3. Busca bot en sala
const bot = scene.findUserByUsername('SenseiAI');
if (bot && bot.is_bot === true) {
    
    // 4. Verifica permisos
    const canReply = await axios.post('/api/bot/allow-reply', {
        room_id: 1,
        bot_id: bot.id,
        user_id: user.id
    });
    
    if (canReply.data.data.ok) {
        
        // 5. Genera respuesta
        const response = await axios.post('/api/bot/generate', {
            room_id: 1,
            bot_id: bot.id,
            user_id: user.id,
            message: message,
            language: 'es'
        });
        
        // 6. Respuesta del bot
        const botReply = response.data.data.response;
        // "¡Hola! Claro, la mejor estrategia es..."
        
        const meta = response.data.data.meta;
        // {
        //   provider: 'gemini',
        //   model: 'gemini-1.5-flash',
        //   tokens: { prompt: 120, completion: 45, total: 165 },
        //   language: 'es'
        // }
        
        // 7. Emite a la sala
        scene.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
            user_socket: bot.socket.id,
            message: botReply,
            username: 'SenseiAI',
            avatarId: bot.avatarId,
            chat_color: 'bot',
            animation: AnimationEnum.AVATAR_DOWN_TALK
        });
    }
}
```

## 🔧 Configuración de Providers

```php
// config/services.php o .env

// Gemini (Google)
GEMINI_API_KEY_1=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...

// OpenAI (GPT)
OPENAI_API_KEY_1=sk-proj-...
OPENAI_API_KEY_2=sk-proj-...

// Claude (Anthropic)
CLAUDE_API_KEY_1=sk-ant-...
```

```sql
-- Insertar en base de datos
INSERT INTO api_keys (description, key, type, active) VALUES
('Gemini Primary', 'AIzaSy...', 'gemini_api_key', 1),
('OpenAI Backup', 'sk-proj-...', 'openai_api_key', 1),
('Claude Fallback', 'sk-ant-...', 'claude_api_key', 1);
```

## 📊 Monitoreo en Tiempo Real

```bash
# Ver estadísticas de uso
curl http://localhost:8000/api/bot/ai/stats

{
  "data": {
    "providers": [
      {
        "id": 1,
        "type": "gemini_api_key",
        "description": "Gemini Primary",
        "usage_today": 145
      },
      {
        "id": 2,
        "type": "openai_api_key",
        "description": "OpenAI Backup",
        "usage_today": 23
      }
    ],
    "date": "2025-10-07"
  }
}
```

---

**¡Sistema multi-provider con balanceo automático y fallback implementado! 🎉**
