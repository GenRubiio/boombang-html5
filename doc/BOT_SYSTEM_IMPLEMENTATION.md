# 🤖 Sistema de Bots Conversacionales - Implementación Multi-Provider

## ✅ Estado de Implementación

### Backend (Laravel API)

#### Migraciones Creadas ✅
- `2025_10_07_000001_create_bots_table.php` - Tabla de bots
- `2025_10_07_000002_create_bot_messages_table.php` - Mensajes del chat
- `2025_10_07_000003_create_bot_summaries_table.php` - Resúmenes de conversación
- `2025_10_07_000004_create_bot_facts_table.php` - Hechos persistentes
- ✅ `create_api_keys_table.php` - Ya existía

#### Modelos Creados ✅
- `Bot.php` - Modelo de bot
- `BotMessage.php` - Mensajes
- `BotSummary.php` - Resúmenes
- `BotFact.php` - Hechos
- ✅ `ApiKey.php` - Ya existía

#### Servicios AI Multi-Provider ✅
- `AIProviderInterface.php` - Interfaz común
- `GeminiProvider.php` - Proveedor Gemini
- `OpenAIProvider.php` - Proveedor OpenAI (GPT)
- `ClaudeProvider.php` - Proveedor Anthropic Claude
- `AIProviderManager.php` - **Gestor multi-provider con balanceo**

#### Servicios de Negocio ✅
- `BotConversationService.php` - Servicio principal de conversación

#### Controladores API ✅
- `BotAllowReplyController.php` - Validar cuotas y cooldown
- `BotContextController.php` - Obtener contexto
- `BotGenerateResponseController.php` - Generar respuesta
- `BotConsumeQuotaController.php` - Consumir cuota
- `BotMessagesController.php` - Guardar/obtener mensajes
- `AIProviderStatsController.php` - Estadísticas de uso

#### Rutas API ✅
```php
POST /api/bot/allow-reply       - Verificar si bot puede responder
GET  /api/bot/context            - Obtener contexto
POST /api/bot/generate           - Generar respuesta
POST /api/bot/consume            - Consumir cuota
POST /api/bot/messages           - Guardar mensaje
GET  /api/bot/messages           - Obtener mensajes
GET  /api/bot/ai/stats           - Estadísticas de providers
```

#### Seeders ✅
- `BotConversationSeeder.php` - Crea bots de ejemplo
- `ApiKeySeeder.php` - Crea API keys de ejemplo

### Backend (Node.js Emulator)

#### Utilidades Creadas ✅
- `LanguageDetector.js` - Detecta idioma del mensaje
- `MentionExtractor.js` - Extrae menciones @usuario
- `VisualWidthCalculator.js` - Calcula ancho visual en píxeles

#### Controladores Modificados ✅
- `UserSendChatController.js` - Integrado con sistema de bots

---

## 🎯 Características Implementadas

### 1. Sistema Multi-Provider ⭐
El sistema puede usar **múltiples proveedores de IA** simultáneamente:
- **Gemini** (Google)
- **GPT** (OpenAI)
- **Claude** (Anthropic)

### 2. Balanceo Automático de Carga 📊
- Selección aleatoria ponderada por uso
- Distribución equilibrada entre API keys
- Métricas de uso diario en Redis

### 3. Sistema de Fallback 🔄
Si un proveedor falla, automáticamente intenta con otro:
```php
$aiManager->generateWithFallback($systemPrompt, $messages, $options);
```

### 4. Detección de Idioma Automática 🌍
Detecta y responde en el mismo idioma que el usuario:
- Español
- English
- Русский
- 日本語
- 中文
- 한국어

### 5. Control de Cuotas y Cooldown ⏱️
- Cuota diaria por bot (configurable)
- Cooldown por usuario-bot-sala
- Validación antes de cada respuesta

### 6. Memoria de Conversación 🧠
- Resúmenes incrementales
- Hechos persistentes sobre usuarios
- Contexto optimizado (últimos 10 mensajes)

---

## 📋 Pasos para Completar la Implementación

### 1. Ejecutar Migraciones

```bash
cd api
php artisan migrate
```

### 2. Ejecutar Seeders

```bash
php artisan db:seed --class=BotConversationSeeder
php artisan db:seed --class=ApiKeySeeder
```

### 3. Configurar Variables de Entorno

Edita `.env` en la carpeta `api`:

```env
# Gemini API Keys
GEMINI_API_KEY_1=tu-clave-gemini-aqui
GEMINI_API_KEY_2=otra-clave-gemini-opcional

# OpenAI API Keys (opcional)
OPENAI_API_KEY_1=tu-clave-openai-aqui

# Claude API Keys (opcional)
CLAUDE_API_KEY_1=tu-clave-claude-aqui

# API URL para Node.js
API_URL=http://localhost:8000/api
```

Edita `.env` en la carpeta `server`:

```env
API_URL=http://localhost:8000/api
```

### 4. Instalar Dependencia en Node.js

```bash
cd server
npm install axios
```

### 5. Crear Usuarios Bot en la Base de Datos

Los bots necesitan existir como usuarios en la tabla `users` con `is_bot = 1`. Puedes usar el seeder existente `BotSeeder` o crear manualmente:

```sql
INSERT INTO users (name, email, username, password, avatar, is_bot, active, created_at, updated_at)
VALUES 
('SenseiAI', 'senseiaibot@game.com', 'SenseiAI', '$2y$10$hash', 5, 1, 1, NOW(), NOW()),
('GameMaster', 'gamemasterbot@game.com', 'GameMaster', '$2y$10$hash', 12, 1, 1, NOW(), NOW()),
('TechHelper', 'techhelperbot@game.com', 'TechHelper', '$2y$10$hash', 8, 1, 1, NOW(), NOW());
```

### 6. Agregar API Keys desde Backpack

1. Accede a `/admin/api-key`
2. Agrega tus API keys reales
3. Marca como `active = true` las que quieras usar

---

## 🔧 Uso del Sistema

### Desde el Juego (Chat)

```
Usuario: @SenseiAI hola, ¿cómo estás?
SenseiAI: ¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy? 😊

Usuario: @GameMaster what's the best strategy?
GameMaster: The best strategy is to stay focused and keep practicing! 🎮
```

### Desde Node.js (Programático)

El sistema se activa automáticamente cuando:
1. Un usuario envía un mensaje con `@BotName`
2. El bot mencionado existe en la sala
3. El usuario mencionado tiene `is_bot = true`

### API Directa (Testing)

```bash
# Verificar si puede responder
curl -X POST http://localhost:8000/api/bot/allow-reply \
  -H "Content-Type: application/json" \
  -d '{"room_id":1,"bot_id":1,"user_id":5}'

# Generar respuesta
curl -X POST http://localhost:8000/api/bot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "room_id":1,
    "bot_id":1,
    "user_id":5,
    "message":"Hola, ¿cómo estás?",
    "language":"es"
  }'

# Ver estadísticas
curl http://localhost:8000/api/bot/ai/stats
```

---

## 🎨 Personalización

### Agregar Nuevo Proveedor de IA

1. Crear proveedor en `app/Services/AI/Providers/`:

```php
class NewProvider implements AIProviderInterface {
    public function generate($systemPrompt, $messages, $options) {
        // Implementación
    }
}
```

2. Registrar en `AIProviderManager`:

```php
protected array $providerMap = [
    'new_api_key' => NewProvider::class,
];
```

3. Agregar API key en la base de datos con `type = 'new_api_key'`

### Modificar Personalidad del Bot

Edita el bot en la base de datos:

```sql
UPDATE bots 
SET system_prompt = 'Nueva personalidad aquí...'
WHERE name = 'SenseiAI';
```

---

## 📊 Monitoreo

### Ver Uso de Providers

```bash
curl http://localhost:8000/api/bot/ai/stats
```

Respuesta:
```json
{
  "data": {
    "providers": [
      {
        "id": 1,
        "type": "gemini_api_key",
        "description": "Gemini API Key #1",
        "usage_today": 45
      },
      {
        "id": 2,
        "type": "openai_api_key",
        "description": "OpenAI API Key #1",
        "usage_today": 12
      }
    ],
    "date": "2025-10-07"
  }
}
```

### Ver Mensajes de una Sala

```bash
curl http://localhost:8000/api/bot/messages?room_id=1&limit=20
```

---

## 🚀 Optimizaciones Implementadas

1. **Balanceo de carga** entre múltiples API keys
2. **Fallback automático** si un provider falla
3. **Cache en Redis** para cuotas y cooldowns
4. **Contexto mínimo viable** (CMV) para reducir tokens
5. **Detección automática de idioma** sin prompts extra
6. **Validación de ancho visual** para evitar mensajes muy largos

---

## 🐛 Troubleshooting

### Bot no responde

1. Verificar que el bot existe en `users` con `is_bot = 1`
2. Verificar que el bot existe en `bots` con `active = 1`
3. Verificar que hay al menos una API key activa
4. Revisar logs de Laravel: `storage/logs/laravel.log`
5. Revisar logs de Node.js en la consola

### Error de cuota excedida

```bash
# Resetear cuota manualmente en Redis
redis-cli DEL "bot:daily_usage:1:20251007"
```

### Cambiar provider preferido

El sistema selecciona automáticamente, pero puedes forzar uno específico modificando `BotConversationService::generateResponse` para pasar `$preferredTypes`:

```php
$aiResponse = $this->aiManager->generateWithFallback(
    $systemPrompt,
    $messages,
    ['temperature' => 0.9, 'max_tokens' => 800],
    ['openai_api_key'] // Solo usar OpenAI
);
```

---

## 📝 Próximos Pasos Sugeridos

1. ✅ Implementar sistema de resúmenes automáticos (Job Queue)
2. ✅ Implementar extracción de hechos (Facts)
3. ✅ Panel de administración de bots en Backpack
4. ✅ Métricas avanzadas (tokens por provider, costos)
5. ✅ Rate limiting por IP para prevenir abuso

---

¡El sistema está listo para usar múltiples proveedores de IA con balanceo automático! 🎉
