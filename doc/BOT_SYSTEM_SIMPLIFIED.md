# 🔄 Sistema Simplificado - Sin Tracking de Salas

## ✅ Cambios Realizados

El sistema ha sido **simplificado** correctamente:

### ❌ Removido: Room Tracking
- Las salas son efímeras y gestionadas por el emulador de Node.js
- Los usuarios y bots se mueven libremente entre salas
- La API no necesita trackear en qué sala está cada usuario

### ✅ Simplificado: Conversación Bot-Usuario
- Las conversaciones son ahora **por par bot-usuario**
- No importa en qué sala se encuentren
- Memoria persistente entre sesiones

## 📊 Nueva Arquitectura

### Base de Datos

```sql
-- Mensajes: solo bot-usuario, sin sala
bot_messages
├── id
├── sender_type        (user | bot)
├── sender_id          (user_id o bot_id)
├── content
├── meta               (lang, provider, tokens)
└── created_at

-- Hechos sobre usuarios
bot_facts
├── id
├── user_id
├── bot_id
├── fact
├── confidence
└── created_at

-- Configuración de bots
bots
├── id
├── name
├── system_prompt
├── settings           (daily_quota, cooldown_sec)
└── active
```

### Redis Keys (Simplificadas)

```
# Cuota diaria por bot
bot:daily_usage:{bot_id}:{YYYYMMDD} = 45

# Cooldown por bot-usuario (sin sala)
bot:cooldown:{bot_id}:{user_id} = 1 (TTL: 2 segundos)

# Uso de AI providers
ai:key_usage:{type}:{key_id}:{YYYYMMDD} = 12
```

## 🔌 API Simplificada

### Endpoints Actualizados

```bash
# 1. Verificar si bot puede responder
POST /api/bot/allow-reply
{
  "bot_id": 1,
  "user_id": 5
}
# ❌ room_id removido

# 2. Generar respuesta
POST /api/bot/generate
{
  "bot_id": 1,
  "user_id": 5,
  "message": "Hola, ¿cómo estás?",
  "language": "es"
}
# ❌ room_id removido

# 3. Obtener contexto
GET /api/bot/context?bot_id=1&user_id=5
# ❌ room_id removido
```

## 💬 Flujo de Conversación

```
Usuario en Sala A:
  "@SenseiAI hola"
  
  → Bot responde: "¡Hola! ¿Qué tal?"
  → Se guarda en memoria bot-usuario

Usuario se mueve a Sala B:
  "@SenseiAI ¿recuerdas lo que hablamos?"
  
  → Bot responde: "Sí, acabamos de saludarnos"
  → Misma conversación, diferente sala ✅
```

## 🚀 Ventajas del Sistema Simplificado

1. **Más Simple:** Menos parámetros, menos complejidad
2. **Más Correcto:** Refleja cómo funcionan las salas (efímeras)
3. **Memoria Persistente:** Los bots recuerdan al usuario sin importar la sala
4. **Menos Carga:** No trackear sala = menos datos

## 📝 Actualizar Migraciones

Si ya ejecutaste las migraciones anteriores, ejecuta esto:

```bash
cd api
php artisan migrate:fresh
php artisan db:seed --class=BotConversationSeeder
php artisan db:seed --class=ApiKeySeeder
```

O si prefieres mantener datos:

```bash
php artisan migrate:refresh --path=database/migrations/2025_10_07_000002_create_bot_messages_table.php
```

## ✅ Listo para Usar

El sistema ahora es mucho más simple y correcto. Los bots mantienen conversaciones con usuarios **independientes de la sala** donde se encuentren.

**Ejemplo de uso:**

```javascript
// Usuario: "@SenseiAI ayuda"
// Node.js solo envía:
{
  bot_id: 1,
  user_id: 5,
  message: "ayuda",
  language: "es"
}

// API responde con el mensaje del bot
// Node.js lo emite en la sala actual
```

¡Mucho mejor! 🎉
