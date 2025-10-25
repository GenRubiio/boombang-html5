# 🚀 Guía de Instalación - Sistema de Bots Multi-Provider

## ✅ Checklist de Implementación

- [x] **Backend Laravel**
  - [x] 4 Migraciones creadas (bots, bot_messages, bot_summaries, bot_facts)
  - [x] 4 Modelos creados (Bot, BotMessage, BotSummary, BotFact)
  - [x] Sistema Multi-Provider (Gemini, OpenAI, Claude)
  - [x] 6 Controladores API
  - [x] Rutas API configuradas
  - [x] 2 Seeders (BotConversationSeeder, ApiKeySeeder)

- [x] **Backend Node.js**
  - [x] 3 Utilidades (LanguageDetector, MentionExtractor, VisualWidthCalculator)
  - [x] UserSendChatController integrado con bots
  - [x] SceneModel con helper findUserByUsername
  - [x] Configuración de bot
  - [x] Ejemplos de uso

- [x] **Documentación**
  - [x] Guía de implementación completa
  - [x] Diagrama de arquitectura
  - [x] Especificación funcional

---

## 📥 Instalación Paso a Paso

### 1. Instalar Dependencia en Node.js

```bash
cd server
npm install axios
```

### 2. Ejecutar Migraciones en Laravel

```bash
cd api
php artisan migrate
```

Esto creará las tablas:
- `bots`
- `bot_messages`
- `bot_summaries`
- `bot_facts`
- `api_keys` (si no existe)

### 3. Ejecutar Seeders

```bash
# Crear bots conversacionales de ejemplo
php artisan db:seed --class=BotConversationSeeder

# Crear estructura de API keys (necesitarás agregar las keys reales después)
php artisan db:seed --class=ApiKeySeeder
```

### 4. Configurar Variables de Entorno

#### En `api/.env`:

```env
# URLs
API_URL=http://localhost:8000/api

# Gemini API Keys (Google)
GEMINI_API_KEY_1=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_API_KEY_2=AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

# OpenAI API Keys (opcional)
OPENAI_API_KEY_1=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_API_KEY_2=sk-proj-YYYYYYYYYYYYYYYYYYYYYYYY

# Claude API Keys (opcional)
CLAUDE_API_KEY_1=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXX
```

#### En `server/.env`:

```env
# API URL
API_URL=http://localhost:8000/api
```

### 5. Crear Usuarios Bot en la Base de Datos

Los bots necesitan existir como usuarios en la tabla `users` con `is_bot = 1`.

**Opción A: Usar el BotSeeder existente**

```bash
cd api
php artisan db:seed --class=BotSeeder
```

**Opción B: Crear manualmente**

```sql
INSERT INTO users (name, email, username, password, avatar, email_verified_at, is_bot, active, created_at, updated_at)
VALUES 
('SenseiAI', 'senseiaibot@game.com', 'SenseiAI', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, NOW(), 1, 1, NOW(), NOW()),
('GameMaster', 'gamemasterbot@game.com', 'GameMaster', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 12, 1, 1, NOW(), NOW()),
('TechHelper', 'techhelperbot@game.com', 'TechHelper', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 8, 1, 1, NOW(), NOW());
```

Luego asignarles el rol de User:

```sql
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'User' LIMIT 1),
    'App\\Models\\User',
    id
FROM users WHERE is_bot = 1;
```

### 6. Agregar API Keys Reales

**Opción A: Desde Backpack Admin**

1. Accede a `http://localhost:8000/admin/api-key`
2. Crea nuevas API keys con tus claves reales
3. Selecciona el tipo apropiado (`gemini_api_key`, `openai_api_key`, `claude_api_key`)
4. Marca como `active = true`

**Opción B: Directamente en la Base de Datos**

```sql
INSERT INTO api_keys (description, `key`, type, active, created_at, updated_at)
VALUES 
('Gemini Primary', 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'gemini_api_key', 1, NOW(), NOW()),
('OpenAI Backup', 'sk-proj-XXXXXXXXXXXXXXXXXXXXXXXX', 'openai_api_key', 1, NOW(), NOW()),
('Claude Fallback', 'sk-ant-XXXXXXXXXXXXXXXXXXXXXXXX', 'claude_api_key', 1, NOW(), NOW());
```

### 7. Conectar Bots al Juego (Opcional)

Si quieres que los bots se conecten físicamente al juego como jugadores:

```bash
cd server
node src/packages/bots/BotsPackage.js
```

O edita el archivo principal del servidor para iniciar los bots automáticamente.

---

## 🧪 Probar el Sistema

### Test 1: Verificar Migraciones

```bash
cd api
php artisan migrate:status
```

Deberías ver las nuevas tablas:
- `2025_10_07_000001_create_bots_table`
- `2025_10_07_000002_create_bot_messages_table`
- `2025_10_07_000003_create_bot_summaries_table`
- `2025_10_07_000004_create_bot_facts_table`

### Test 2: Verificar Bots Creados

```sql
SELECT id, name, system_prompt, active FROM bots;
```

Deberías ver:
- SenseiAI
- GameMaster
- TechHelper

### Test 3: Verificar API Keys

```sql
SELECT id, description, type, active FROM api_keys;
```

### Test 4: Probar API de Bots

```bash
# Verificar si bot puede responder
curl -X POST http://localhost:8000/api/bot/allow-reply \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "bot_id": 1,
    "user_id": 5
  }'

# Generar respuesta (requiere API key válida)
curl -X POST http://localhost:8000/api/bot/generate \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "bot_id": 1,
    "user_id": 5,
    "message": "Hola, ¿cómo estás?",
    "language": "es"
  }'

# Ver estadísticas de providers
curl http://localhost:8000/api/bot/ai/stats
```

### Test 5: Probar en el Juego

1. Inicia el servidor de Laravel: `php artisan serve`
2. Inicia el servidor de Node.js: `npm start` (en carpeta `server`)
3. Inicia el cliente del juego
4. Conéctate y ve a una sala
5. Envía un mensaje: `@SenseiAI hola`
6. El bot debería responder automáticamente

---

## 🎯 Configuración Avanzada

### Personalizar un Bot

```sql
UPDATE bots 
SET system_prompt = 'You are a friendly pirate bot who speaks like a pirate! Arrr!'
WHERE name = 'SenseiAI';
```

### Ajustar Cuotas

```sql
UPDATE bots 
SET settings = JSON_SET(settings, '$.daily_quota', 1000, '$.cooldown_sec', 5)
WHERE name = 'GameMaster';
```

### Agregar Nuevo Provider de IA

1. Crear clase provider en `api/app/Services/AI/Providers/NewProvider.php`
2. Implementar `AIProviderInterface`
3. Registrar en `AIProviderManager::$providerMap`
4. Agregar API key con tipo `new_api_key`

### Monitoreo de Redis

```bash
# Ver todas las keys de bots
redis-cli KEYS "bot:*"

# Ver cuota diaria de un bot
redis-cli GET "bot:daily_usage:1:20251007"

# Ver cooldown
redis-cli TTL "bot:cooldown:1:5:1"

# Ver uso de API keys
redis-cli KEYS "ai:key_usage:*"
```

---

## 🐛 Solución de Problemas

### Problema: Bot no responde

**Checklist:**
- [ ] ¿El bot existe en tabla `users` con `is_bot = 1`?
- [ ] ¿El bot existe en tabla `bots` con `active = 1`?
- [ ] ¿El bot está conectado en la sala?
- [ ] ¿Hay al menos una API key activa?
- [ ] ¿La cuota diaria no está excedida?
- [ ] ¿No hay cooldown activo?

**Verificar logs:**
```bash
# Laravel
tail -f api/storage/logs/laravel.log

# Node.js
# Ver consola del servidor
```

### Problema: Error "No active API keys available"

```bash
# Verificar keys en BD
mysql -u root -p boombang -e "SELECT id, description, type, active FROM api_keys;"

# Activar una key
mysql -u root -p boombang -e "UPDATE api_keys SET active = 1 WHERE id = 1;"
```

### Problema: Cuota excedida

```bash
# Ver cuota actual
redis-cli GET "bot:daily_usage:1:20251007"

# Resetear cuota (para testing)
redis-cli DEL "bot:daily_usage:1:20251007"
```

### Problema: Cooldown activo

```bash
# Ver cooldown
redis-cli TTL "bot:cooldown:1:5:1"

# Eliminar cooldown (para testing)
redis-cli DEL "bot:cooldown:1:5:1"
```

### Problema: Provider falla

El sistema tiene fallback automático. Si un provider falla, intenta con otro.

**Ver qué provider se está usando:**
```bash
curl http://localhost:8000/api/bot/ai/stats
```

**Forzar un provider específico:**

Modifica `BotConversationService::generateResponse`:
```php
$aiResponse = $this->aiManager->generateWithFallback(
    $systemPrompt,
    $messages,
    ['temperature' => 0.9, 'max_tokens' => 800],
    ['gemini_api_key'] // Solo Gemini
);
```

---

## 📊 Métricas y Estadísticas

### Ver uso total por provider

```bash
curl http://localhost:8000/api/bot/ai/stats | jq
```

### Ver mensajes de una sala

```bash
curl "http://localhost:8000/api/bot/messages?room_id=1&limit=50" | jq
```

### Ver todos los bots

```sql
SELECT 
    b.id,
    b.name,
    b.active,
    COUNT(bm.id) as total_messages
FROM bots b
LEFT JOIN bot_messages bm ON bm.sender_id = b.id AND bm.sender_type = 'bot'
GROUP BY b.id, b.name, b.active;
```

---

## 🎉 ¡Listo!

El sistema está completamente implementado con:
- ✅ Multi-provider (Gemini, OpenAI, Claude)
- ✅ Balanceo automático de carga
- ✅ Fallback entre providers
- ✅ Detección automática de idioma
- ✅ Sistema de cuotas y cooldown
- ✅ Memoria de conversación
- ✅ Integración completa con Node.js

**Siguiente paso:** Obtén tus API keys y empieza a chatear con los bots! 🤖

---

## 📚 Documentación Adicional

- [BOT_SYSTEM_ARCHITECTURE.md](./BOT_SYSTEM_ARCHITECTURE.md) - Arquitectura detallada
- [BOT_SYSTEM_IMPLEMENTATION.md](./BOT_SYSTEM_IMPLEMENTATION.md) - Guía de implementación
- [bots_functional_spec.md](./bots_functional_spec.md) - Especificación funcional original
- [server/src/examples/botSystemExamples.js](../server/src/examples/botSystemExamples.js) - Ejemplos de uso

---

**¿Preguntas? Revisa los logs y la documentación. ¡Happy coding! 🚀**
