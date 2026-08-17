<template>
  <div class="avatar-look-debug-panel" v-if="visible">
    <div class="alp-header">
      <strong>Avatar Look Debug</strong>
      <button type="button" @click="visible = false">×</button>
    </div>

    <div class="alp-body">
      <div v-if="!manifest" class="alp-loading">
        No compiled layered manifest available for avatar {{ avatarId }}.
      </div>

      <template v-else>
        <div v-for="slot in manifest.slots" :key="slot" class="alp-slot-row">
          <label>{{ manifest.labels[slot] ?? slot }}</label>

          <select
            v-if="slot === manifest.gloveSlot"
            v-model="draft[slot]"
          >
            <option
              v-for="preset in glovePresets"
              :key="preset.name"
              :value="preset.name"
              :disabled="preset.index > uppercutLevel"
            >
              {{ presetLabel(preset.name) }}{{ preset.index > uppercutLevel ? ' (locked)' : '' }}
            </option>
          </select>

          <input
            v-else
            type="text"
            v-model="draft[slot]"
            :placeholder="manifest.defaults[slot]"
          />

          <button type="button" @click="submitSlot(slot)">Apply</button>
        </div>

        <div v-if="lastPaletteAck" class="alp-ack" :class="lastPaletteAck.success ? 'alp-ok' : 'alp-err'">
          {{
            lastPaletteAck.success
              ? 'Palette change accepted'
              : `Rejected: ${lastPaletteAck.code} — ${lastPaletteAck.message}`
          }}
        </div>
      </template>

      <hr />

      <div class="alp-slot-row">
        <label>aura</label>
        <select v-model="equippedAura" @change="submitAccessory('aura', equippedAura || null)">
          <option value="">none</option>
          <option v-for="key in ownedAccessories.aura" :key="key" :value="key">{{ key }}</option>
        </select>
      </div>

      <div class="alp-slot-row">
        <label>hat</label>
        <select v-model="equippedHat" @change="submitAccessory('hat', equippedHat || null)">
          <option value="">none</option>
          <option v-for="key in ownedAccessories.hat" :key="key" :value="key">{{ key }}</option>
        </select>
      </div>

      <div class="alp-slot-row">
        <label>pet</label>
        <select v-model="equippedPet" @change="submitAccessory('pet', equippedPet || null)">
          <option value="">none</option>
          <option v-for="key in ownedAccessories.pet" :key="key" :value="key">{{ key }}</option>
        </select>
      </div>

      <div v-if="lastAccessoryAck" class="alp-ack" :class="lastAccessoryAck.success ? 'alp-ok' : 'alp-err'">
        {{
          lastAccessoryAck.success
            ? 'Accessory change accepted'
            : `Rejected: ${lastAccessoryAck.code} — ${lastAccessoryAck.message}`
        }}
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import AvatarEnum from "@/enums/AvatarEnum";

// Mirrors server/src/enums/GlovePresetsEnum.js (design.md §5): UppercutsEnum index -> name.
// Display-only here — the server re-checks the unlock tier (PROTO1); this list exists so the
// panel can render the ten options and grey out the locked ones.
const GLOVE_PRESET_NAMES = [
  'red', 'pink', 'orange', 'green', 'blue', 'white', 'purple', 'brown', 'black', 'gold',
];
const GLOVE_PRESETS = GLOVE_PRESET_NAMES.map((name, index) => ({ name, index }));

// One entry per compiled layered character (mirrors AvatarManager.js's LAYERED_*_LOADERS,
// duplicated here deliberately: this Vue component does not reach into Phaser's scene-gated
// loader lifecycle, it just needs to read the manifest as plain data).
const LAYERED_MANIFEST_LOADERS = {
  [AvatarEnum.RASTA]: () => import('@/assets/game/avatars/rasta/layers/rasta.layers.manifest.json'),
};

export default {
  name: 'AvatarLookDebugPanel',
  data() {
    return {
      visible: true,
      avatarId: null,
      manifest: null,
      draft: {},
      uppercutLevel: 0,
      lastPaletteAck: null,
      glovePresets: GLOVE_PRESETS,
      ownedAccessories: { hat: [], pet: [], aura: [] },
      equippedAura: '',
      equippedHat: '',
      equippedPet: '',
      lastAccessoryAck: null,
    };
  },
  async created() {
    this.avatarId = socket.user?.avatar_id ?? AvatarEnum.RASTA;
    this.uppercutLevel = socket.user?.uppercut_level ?? 0;
    await this.loadManifest();

    socket.on(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, (ack) => {
      this.lastPaletteAck = ack;
    });

    socket.on(ResponseSocketsEnum.GET_USER_ACCESSORIES, (data) => {
      this.ownedAccessories = data.owned || { hat: [], pet: [], aura: [] };
      this.equippedAura = (data.equipped && data.equipped.aura) || '';
      this.equippedHat = (data.equipped && data.equipped.hat) || '';
      this.equippedPet = (data.equipped && data.equipped.pet) || '';
    });
    socket.on(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK, (ack) => {
      this.lastAccessoryAck = ack;
    });
    socket.emit(RequestSocketsEnum.GET_USER_ACCESSORIES);
  },
  beforeUnmount() {
    socket.off(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK);
    socket.off(ResponseSocketsEnum.GET_USER_ACCESSORIES);
    socket.off(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK);
  },
  methods: {
    async loadManifest() {
      const loader = LAYERED_MANIFEST_LOADERS[this.avatarId];
      if (!loader) {
        this.manifest = null;
        return;
      }
      const { default: manifest } = await loader();
      this.manifest = manifest;
      // server/src/resources/UserResource.js emits the singular key `avatar_palette` (map
      // avatarId -> slots), passed straight through by the login/select-user socket payload.
      const savedPalette = (socket.user?.avatar_palette || {})[this.avatarId] || {};
      this.draft = {};
      manifest.slots.forEach((slot) => {
        this.draft[slot] =
          savedPalette[slot] ??
          (slot === manifest.gloveSlot ? GLOVE_PRESET_NAMES[0] : manifest.defaults[slot]);
      });
    },
    presetLabel(name) {
      // Falls back to the raw preset name if vue-i18n or the translation key is unavailable —
      // this panel is a developer tool, not the localized product UI (proposal.md non-goals).
      try {
        return this.$t(`user_card.statistics.rings.${name}`);
      } catch (e) {
        return name;
      }
    },
    submitSlot(slot) {
      socket.emit(RequestSocketsEnum.USER_CHANGE_PALETTE, {
        avatarId: this.avatarId,
        slots: { [slot]: this.draft[slot] },
      });
    },
    submitAccessory(kind, value) {
      socket.emit(RequestSocketsEnum.USER_CHANGE_ACCESSORY, { kind, value });
    },
  },
};
</script>

<style scoped>
.avatar-look-debug-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 320px;
  background: rgba(20, 20, 20, 0.92);
  color: #eee;
  font-family: monospace;
  font-size: 12px;
  z-index: 99999;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px;
}
.alp-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.alp-slot-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.alp-slot-row label {
  flex: 0 0 70px;
}
.alp-slot-row input,
.alp-slot-row select {
  flex: 1;
}
.alp-ack {
  margin-top: 6px;
  padding: 4px;
}
.alp-ok {
  background: #1f5c2e;
}
.alp-err {
  background: #5c1f1f;
}
</style>
