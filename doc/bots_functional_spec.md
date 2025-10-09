# 🤖 Sistema de Bots Multilingües con Memoria para Juego Online (Node + Laravel + MySQL)

## 📋 Descripción General

El sistema permite integrar **bots conversacionales inteligentes** dentro de salas de chat del juego, en las cuales pueden haber **N usuarios humanos y N bots simultáneamente**.

Los bots pueden:
- Participar en el chat cuando son **mencionados** por un usuario mediante `@NombreBot`.
- **Responder en el mismo idioma** que el mensaje recibido (soporta español, inglés, ruso, japonés, chino y coreano).
- **Recordar conversaciones previas resumidas** por usuario/sala/bot.
- **Tener cuota diaria limitada de mensajes**, ajustable (por defecto 300 mensajes/día).
- Utilizar un **pool de API keys** (`gemini_api_key`) almacenadas en la tabla `api_keys`, distribuyendo automáticamente las cuotas entre ellas.

---

## ⚙️ Stack Tecnológico

| Componente | Descripción |
|-------------|--------------|
| **Node.js** | Emulador del juego. Gestiona las salas, usuarios, mensajes y comunicación en tiempo real mediante Socket.io. |
| **Laravel 11/12** | API backend encargada de la persistencia, control de cuotas, gestión de memoria de bots y selección aleatoria de API keys. |
| **MySQL** | Base de datos principal para almacenamiento estructurado de mensajes, resúmenes, hechos, hilos y configuraciones. |
| **Redis** | Cache y control de cuotas (ratelimit + uso diario por bot). |
| **Gemini API** | Modelo de lenguaje usado para generar las respuestas de los bots. Las claves están almacenadas en la tabla `api_keys`. |

---

## 🧩 Flujo General

1. **Usuario envía un mensaje** en una sala a través del cliente (WebSocket).
2. **Node** recibe el mensaje, mide su **ancho visual**, detecta **idioma** y menciones `@BotName`.
3. Node envía el mensaje a **Laravel API** → se guarda en `bot_messages`.
4. Por cada bot mencionado:
   - Laravel comprueba si **puede responder** (cuota diaria y cooldown).
   - Laravel obtiene un **contexto compacto** (últimos mensajes, resumen, hechos).
   - Se selecciona una **API Key aleatoria disponible** del tipo `gemini_api_key`.
   - Laravel o Node llama a Gemini usando esa API key.
   - El bot responde en el **mismo idioma** que el usuario.
   - Laravel registra la respuesta, actualiza uso de API key y cuota diaria del bot.
5. Node retransmite la respuesta del bot a todos los usuarios de la sala.

---

## 🗃️ Estructura de Tablas Principales

### Tabla: `bots`
| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | BIGINT | ID del bot |
| name | VARCHAR(100) | Nombre (usado en mención `@name`) |
| system_prompt | TEXT | Prompt base con personalidad y estilo |
| language_mode | ENUM(auto, es, en, ru, ja, zh, ko) | Modo de idioma |
| settings | JSON | Config (ej: {"daily_quota":300, "cooldown_sec":2}) |
| created_at / updated_at | DATETIME | Timestamps |

---

### Tabla: `bot_messages`
| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | BIGINT | PK |
| room_id | BIGINT | ID de la sala |
| thread_id | BIGINT | ID del hilo de conversación (opcional) |
| sender_type | ENUM('user','bot') | Tipo de emisor |
| sender_id | BIGINT | ID de usuario o bot |
| content | TEXT | Texto del mensaje |
| meta | JSON | { "lang": "es", "width_px": 3820 } |
| created_at | DATETIME | Fecha de creación |

---

### Tabla: `bot_summaries`
Guarda un resumen compacto de la conversación entre un bot y los usuarios de la sala.

| Campo | Tipo |
|--------|------|
| id | BIGINT |
| room_id | BIGINT |
| bot_id | BIGINT |
| summary | MEDIUMTEXT |
| last_message_id | BIGINT |
| updated_at | DATETIME |

---

### Tabla: `bot_facts`
Hechos persistentes extraídos del contexto (preferencias, datos importantes del usuario).

| Campo | Tipo |
|--------|------|
| id | BIGINT |
| user_id | BIGINT |
| bot_id | BIGINT |
| fact | TEXT |
| confidence | TINYINT |
| source | ENUM('extracted','manual') |
| created_at / updated_at | DATETIME |

---

### Tabla: `api_keys`
Tabla para almacenar múltiples claves API con diferentes tipos.

| Campo | Tipo | Descripción |
|--------|------|-------------|
| id | BIGINT | PK |
| description | VARCHAR(255) | Descripción |
| key | VARCHAR(255) | Valor real de la API key |
| type | ENUM('gemini_api_key', 'openai_api_key', 'anthropic_api_key', ...) | Tipo de clave |
| active | BOOLEAN | Activa o no |
| created_at / updated_at | DATETIME | Fechas de control |

---

## 🎯 Distribución de Cuotas de API Keys (Gemini)

Cada API key tiene una **cuota diaria compartida**.  
Para distribuir las cargas de manera aleatoria y equilibrada:

### Lógica en Laravel (servicio `GeminiKeyManager`)

```php
namespace App\Services;

use App\Models\ApiKey;
use Illuminate\Support\Facades\Redis;

class GeminiKeyManager
{
    public static function getRandomKey(): ?string
    {
        $keys = ApiKey::where('type', 'gemini_api_key')->where('active', true)->pluck('key');
        if ($keys->isEmpty()) return null;

        $selected = $keys->random();
        $dayKey = now()->format('Ymd');
        $usageKey = "gemini:key_usage:$selected:$dayKey";

        Redis::incr($usageKey);
        Redis::expireAt($usageKey, now()->endOfDay()->timestamp);

        return $selected;
    }

    public static function getUsageStats(): array
    {
        $keys = ApiKey::where('type', 'gemini_api_key')->where('active', true)->pluck('key');
        $dayKey = now()->format('Ymd');
        $stats = [];
        foreach ($keys as $k) {
            $stats[$k] = (int) Redis::get("gemini:key_usage:$k:$dayKey");
        }
        return $stats;
    }
}
```

---

## 🧠 Memoria y Resumen de Conversación

Cada bot mantiene un **resumen incremental** de la conversación en la sala:
- Se actualiza cada **6–8 mensajes** nuevos.
- Se almacena en `bot_summaries`.
- Se usan **jobs en cola** para generar o actualizar el resumen.

---

## 🗣️ Flujo de Conversación (Node + Laravel)

1. Usuario envía mensaje
2. Node detecta idioma y menciones `@BotName`.
3. Laravel valida cuotas, cooldown y ancho visual.
4. Laravel selecciona API key de Gemini y genera respuesta en el mismo idioma.
5. Node emite respuesta en sala.

---

## 🗺️ Ubicaciones del Proyecto y Puntos de Integración

**Rutas locales (Windows):**
- **Laravel API**: `C:\Users\evgeny.lyubeznyy\Desktop\Proyectos\boombang-html5\api`
- **Servidor Node (emulador)**: `C:\Users\evgeny.lyubeznyy\Desktop\Proyectos\boombang-html5\server`

**Punto de entrada de mensajes (Node):**
- **Archivo**: `C:\Users\evgeny.lyubeznyy\Desktop\Proyectos\boombang-html5\server\src\controllers\game\scenes\UserSendChatController.js`  
  Aquí se **recibe cada mensaje** enviado por un **usuario o bot**. En este controlador debemos:
  1) **Detectar menciones** `@NombreUser`.  
  2) **Resolver el usuario mencionado** buscando en la lista de usuarios **de la sala**.  
     - **Modelo**: `C:\Users\evgeny.lyubeznyy\Desktop\Proyectos\boombang-html5\server\src\models\SceneModel.js` (contiene la **lista de users** en sala).  
  3) Si el usuario mencionado tiene el atributo **`is_bot === true`**, comenzar el **flujo de respuesta del bot** (obtener contexto desde Laravel, validar cuota/cooldown, seleccionar API key aleatoria `gemini_api_key`, generar respuesta y emitirla).

### Pseudocódigo de integración en `UserSendChatController.js`

```js
// 1) Extraer menciones
const mentions = extractMentions(messageText); // ['SenseiAI']

// 2) Por cada mención, resolver en sala
for (const name of mentions) {
  const mentioned = SceneModel.findUserInRoom(roomId, name); // busca por display_name / username

  if (!mentioned) continue;

  // 3) Si es bot, activar pipeline optimizado
  if (mentioned.is_bot === true) {
    // (a) Validar cuota/cooldown con Laravel
    const allow = await api.post('/bot/allow-reply', { room_id: roomId, bot_id: mentioned.id, user_id });

    if (!allow.data.ok) continue;

    // (b) Obtener contexto mínimo viable
    const ctx = await api.get('/bot/context', { params: { room_id: roomId, bot_id: mentioned.id } });

    // (c) Pedir API key aleatoria de tipo gemini_api_key (balanceo por Redis)
    const { data: key } = await api.get('/gemini/key-random'); // o servicio interno
    const reply = await llm.generate({ key, ctx, lang }); // responder SIEMPRE en el idioma del mensaje entrante

    // (d) Persistir y emitir
    await api.post('/bot/messages', { room_id: roomId, sender_type: 'bot', sender_id: mentioned.id, content: reply, meta: { lang } });
    io.to(roomId).emit('chat:message', { senderType: 'bot', userId: mentioned.id, text: reply, lang });

    // (e) Consumir cuota
    await api.post('/bot/consume', { bot_id: mentioned.id });
  }
}
```

> **Nota**: `SceneModel.js` debe exponer un método de búsqueda **O(1)/O(log n)** en sala (por ejemplo, indexando por `display_name`/`username` en un `Map`) para resolver menciones **sin escanear listas**.

---

## 🚀 Reglas de Optimización (Tokens & Latencia)

1. **Contexto mínimo viable (CMV)**: incluir solo
   - `summary` (<= 500–600 palabras),
   - `facts` top-10 relevantes,
   - **últimos 8–12** mensajes recientes.
2. **Resúmenes incrementales** cada **6–8** mensajes para mantener el CMV estable (reduce tokens).
3. **Memoización en Redis** del contexto por `(room_id, bot_id, last_message_id)` con TTL corto (30–60s) para ráfagas.
4. **Colas por bot** (concurrencia 1) para evitar carreras y mantener el orden.
5. **Rotación aleatoria de API keys** `gemini_api_key` con métrica de uso diario (Redis) para **balancear cuota** y evitar throttling.
6. **Validación por ancho visual** en cliente y servidor: descarta mensajes que excedan el **límite de píxeles** antes de llamar al LLM.
7. **Cooldown** por `(user_id, bot_id)` (p. ej. 2–3s) para reducir llamadas repetitivas.
8. **Respuesta en el idioma del mensaje entrante** para evitar traducciones extra o prompts adicionales.
9. **Evitar eco de contexto** en la respuesta (instrucción explícita en `system`): el bot **no** debe repetir `summary`/`facts`/histórico.
10. **Compresión de prompts** (elimina whitespace excesivo, compacta JSON, usa marcadores de sección).
11. **Telemetría**: log de `prompt_tokens` y `completion_tokens` por bot y por API key para **tuning** posterior.

---
