<template>
  <div class="avatar-look-debug-panel" v-if="visible">
    <div class="alp-header">
      <strong>Avatar Look Debug</strong>
      <button type="button" @click="visible = false">×</button>
    </div>

    <div class="alp-body">
      <div class="alp-slot-row">
        <label>character</label>
        <select v-model="selectedAvatarId" @change="switchCharacter(selectedAvatarId)">
          <option v-for="character in availableCharacters" :key="character.avatarId" :value="character.avatarId">
            {{ character.name }}
          </option>
        </select>
      </div>

      <div v-if="switchAck" class="alp-ack" :class="switchAck.success ? 'alp-ok' : 'alp-err'">
        {{ switchAck.message }}
      </div>

      <hr />

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

      <!-- Options list the FULL COMPILED catalogue for the current character (design.md §4/§7's
           character-scoped accessory registry, via AccessoryManager.listKeysForCharacter),
           not the account's owned subset — this is a developer visual-testing affordance, so
           ownership is shown as a "(not owned)" marker rather than filtering the list, letting
           a dev preview a compiled accessory the account never bought (still ownership-gated
           server-side on Apply, unchanged: the archived `avatar-color-accessory-system`
           proposal.md's own non-goals rule out a product colour/accessory wizard). -->
      <div class="alp-slot-row">
        <label>aura</label>
        <select v-model="equippedAura" @change="submitAccessory('aura', equippedAura || null)">
          <option value="">none</option>
          <option v-for="key in availableAccessories.aura" :key="key" :value="key">
            {{ key }}{{ ownedAccessories.aura.includes(key) ? '' : ' (not owned)' }}
          </option>
        </select>
      </div>

      <div class="alp-slot-row">
        <label>hat</label>
        <select v-model="equippedHat" @change="submitAccessory('hat', equippedHat || null)">
          <option value="">none</option>
          <option v-for="key in availableAccessories.hat" :key="key" :value="key">
            {{ key }}{{ ownedAccessories.hat.includes(key) ? '' : ' (not owned)' }}
          </option>
        </select>
      </div>

      <div class="alp-slot-row">
        <label>pet</label>
        <select v-model="equippedPet" @change="submitAccessory('pet', equippedPet || null)">
          <option value="">none</option>
          <option v-for="key in availableAccessories.pet" :key="key" :value="key">
            {{ key }}{{ ownedAccessories.pet.includes(key) ? '' : ' (not owned)' }}
          </option>
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
import avatarManager from "@/phaser/managers/AvatarManager.js";
import accessoryManager from "@/phaser/managers/AccessoryManager.js";
import { listLayeredCharacters, characterNameForAvatarId } from "@/phaser/managers/listLayeredCharacters.js";
import { findActiveGameplayScene } from "@/phaser/shared/findActiveGameplayScene.js";
import { spawnAvatarUser } from "@/phaser/shared/spawnAvatarUser.js";
import RemoveUserController from "@/phaser/controllers/scene/RemoveUserController.js";

// Mirrors server/src/enums/GlovePresetsEnum.js (design.md §5): UppercutsEnum index -> name.
// Display-only here — the server re-checks the unlock tier (PROTO1); this list exists so the
// panel can render the ten options and grey out the locked ones.
const GLOVE_PRESET_NAMES = [
  'red', 'pink', 'orange', 'green', 'blue', 'white', 'purple', 'brown', 'black', 'gold',
];
const GLOVE_PRESETS = GLOVE_PRESET_NAMES.map((name, index) => ({ name, index }));

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
      // Character switcher (dev-only, session-only — never persisted, never the product
      // colour/accessory wizard the archived avatar-color-accessory-system proposal.md's own
      // non-goals rule out). See switchCharacter().
      availableCharacters: [],
      selectedAvatarId: null,
      switchAck: null,
      // Catalogue-sourced accessory options for the CURRENTLY selected character (design.md
      // §4/§7's character-scoped registry) — refreshed on mount and on every character switch.
      availableAccessories: { hat: [], pet: [], aura: [] },
    };
  },
  async created() {
    this.avatarId = socket.user?.avatar_id ?? AvatarEnum.RASTA;
    this.selectedAvatarId = this.avatarId;
    this.uppercutLevel = socket.user?.uppercut_level ?? 0;
    this.refreshAvailableCharacters();
    this.refreshAvailableAccessories();
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
      // Resolves through AvatarManager's own real registry (avatarManager.getOrLoadLayeredManifest,
      // manifest-only — no scene/atlas load needed just to read slot metadata) instead of this
      // panel's own previously hand-duplicated, rasta-only loader map — the pre-existing map
      // covered ONLY rasta, so the panel silently showed no manifest at all for any of the other
      // 15 migrated characters even before this task's character switcher existed. Fixed here
      // because "slot rows reflect the selected character" needs it for every character, not
      // just rasta.
      const manifest = await avatarManager.getOrLoadLayeredManifest(this.avatarId);
      this.manifest = manifest;
      if (!manifest) {
        this.draft = {};
        return;
      }
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
    /**
     * Every AvatarEnum character with a compiled layered manifest (avatarManager.isLayeredAvatar,
     * the SAME gate AddUserController.createAvatarSprite uses), sorted for a deterministic UI
     * order. Pure filter/sort logic lives in listLayeredCharacters.js (unit-tested there).
     */
    refreshAvailableCharacters() {
      const candidates = Object.entries(AvatarEnum).map(([key, avatarId]) => ({
        avatarId,
        name: key.toLowerCase(),
        isLayered: avatarManager.isLayeredAvatar(avatarId),
      }));
      this.availableCharacters = listLayeredCharacters(candidates);
    },
    /**
     * Full compiled catalogue (AccessoryManager.listKeysForCharacter) for the CURRENTLY
     * selected character — not the account's owned subset (coordinator addendum: a developer
     * visual-testing tool should show what actually renders, ownership stays a marker only).
     * Uses characterNameForAvatarId, not AvatarManager.getAvatarName — live-caught defect:
     * getAvatarName's own hardcoded dict has no SALLY entry (falls through to "unknown"),
     * confirmed against the real running client when switching to her.
     */
    refreshAvailableAccessories() {
      const character = characterNameForAvatarId(this.avatarId, AvatarEnum);
      this.availableAccessories = {
        hat: accessoryManager.listKeysForCharacter(character, 'hat'),
        pet: accessoryManager.listKeysForCharacter(character, 'pet'),
        aura: accessoryManager.listKeysForCharacter(character, 'aura'),
      };
    },
    /**
     * Dev-only, session-only character switch (never persisted, never the product
     * colour/accessory wizard the archived avatar-color-accessory-system proposal.md's own
     * non-goals rule out). Deliberately does NOT use the existing product
     * USER_CHANGE_AVATAR socket request: that path is (a) ownership-gated server-side
     * (UserChangeAvatarController.js: `user.avatars.includes(data.avatar)`), which is exactly
     * why an account cannot preview a character it does not own — the whole reason this
     * control exists — and (b) even on success, its client broadcast handler
     * (UserChangeAvatarController.js under phaser/controllers/scene) builds a plain
     * `gameScene.add.sprite(atlasKey)`, never a LayeredAvatar instance, so a layered character
     * would render as a raw, unlayered atlas frame — a genuinely half-applied avatar, not a
     * working preview. Instead this reuses the SAME real construction primitive
     * (spawnAvatarUser, design.md §10 — the one primitive both PerfHarness and the Playwright
     * resolved-state harness already delegate to) and the SAME cleanup (RemoveUserController)
     * every other user removal already uses, to rebuild the local player's own sprite in place.
     */
    async switchCharacter(rawAvatarId) {
      const avatarId = parseInt(rawAvatarId, 10);
      if (avatarId === this.avatarId) {
        return;
      }

      const scene = findActiveGameplayScene(typeof window !== 'undefined' ? window.game : null);
      if (!scene) {
        this.switchAck = { success: false, message: 'No active game scene yet — enter a room first.' };
        this.selectedAvatarId = this.avatarId;
        return;
      }

      const socketId = socket.id;
      const localUser = scene.users[socketId];
      if (!localUser) {
        this.switchAck = { success: false, message: 'Local player not found in the active scene.' };
        this.selectedAvatarId = this.avatarId;
        return;
      }

      try {
        await avatarManager.loadAvatar(scene, avatarId);
      } catch (err) {
        // Best-effort, matches spawnAvatarUser's own precedent: proceed anyway —
        // createAvatarSprite falls back to its own "atlas not found" placeholder.
      }

      const position = localUser.position || {};
      const username = localUser.username;
      // Persisted per-avatarId palette carried over if the account already has one saved for
      // the target character — same lookup AddUserController.createAvatarSprite already does.
      const savedPalette = (socket.user?.avatar_palette || {})[avatarId];

      RemoveUserController.main(scene, socketId);
      await spawnAvatarUser(scene, {
        socketId,
        avatarId,
        x: position.x ?? 0,
        y: position.y ?? 0,
        username,
        showUsername: true,
        accessories: {
          hat: this.equippedHat || undefined,
          pet: this.equippedPet || undefined,
          aura: this.equippedAura || undefined,
        },
        palette: savedPalette,
      });

      this.avatarId = avatarId;
      this.selectedAvatarId = avatarId;
      await this.loadManifest();
      this.refreshAvailableAccessories();
      this.switchAck = {
        success: true,
        message: `Switched to ${characterNameForAvatarId(avatarId, AvatarEnum)} (session-only, not persisted).`,
      };
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
