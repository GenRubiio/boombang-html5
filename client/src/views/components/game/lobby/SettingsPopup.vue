<template>
  <div class="settings-popup">
    <div class="content">
      <button class="close-button" @click="$emit('close')">
        <i class="las la-times"></i>
      </button>
      <h2 class="main-title">{{ $t("settings.main_title") }}</h2>

      <div class="settings-container">
        <div class="settings-tabs">
          <div
            class="settings-tab"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            {{ $t("settings.tabs.profile") }}
          </div>
          <div
            class="settings-tab"
            :class="{ active: activeTab === 'graphics' }"
            @click="activeTab = 'graphics'"
          >
            {{ $t("settings.tabs.graphics") }}
          </div>
          <div
            class="settings-tab"
            :class="{ active: activeTab === 'sounds' }"
            @click="activeTab = 'sounds'"
          >
            {{ $t("settings.tabs.sounds") }}
          </div>
        </div>

        <div class="settings-content">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="tab-content">
            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.profile.username")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.profile.username_desc") }}
                </div>
                <div v-if="usernameError" class="error-message">
                  {{ usernameError }}
                </div>
              </div>
              <div class="input-with-button">
                <input
                  type="text"
                  v-model="profileSettings.username"
                  class="setting-input"
                  :placeholder="$t('settings.profile.username_placeholder')"
                />
                <button
                  class="save-button-inline"
                  @click="saveUsername"
                  :disabled="isLoading"
                >
                  {{ $t("settings.save") }}
                </button>
              </div>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.profile.language")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.profile.language_desc") }}
                </div>
                <div v-if="languageError" class="error-message">
                  {{ languageError }}
                </div>
              </div>
              <div class="input-with-button">
                <select
                  v-model="profileSettings.language"
                  class="setting-select"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="ru">Русский</option>
                  <option value="zh">简体中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
                <button
                  class="save-button-inline"
                  @click="saveLanguage"
                  :disabled="isLoading"
                >
                  {{ $t("settings.save") }}
                </button>
              </div>
            </div>
          </div>

          <!-- Graphics Tab -->
          <div v-if="activeTab === 'graphics'" class="tab-content">
            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.graphics.render_type")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.graphics.render_type_desc") }}
                </div>
              </div>
              <select
                v-model="graphicsSettings.renderType"
                class="setting-select"
              >
                <option value="auto">AUTO (default)</option>
                <option value="webgl">WEBGL</option>
                <option value="canvas">CANVAS</option>
              </select>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.graphics.antialias")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.graphics.antialias_desc") }}
                </div>
              </div>
              <div class="toggle-container">
                <input
                  type="checkbox"
                  id="antialias"
                  v-model="graphicsSettings.antialias"
                  class="toggle-input"
                />
                <label for="antialias" class="toggle-label"></label>
              </div>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.graphics.antialias_gl")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.graphics.antialias_gl_desc") }}
                </div>
              </div>
              <div class="toggle-container">
                <input
                  type="checkbox"
                  id="antialiasGL"
                  v-model="graphicsSettings.antialiasGL"
                  class="toggle-input"
                />
                <label for="antialiasGL" class="toggle-label"></label>
              </div>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.graphics.pixel_art")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.graphics.pixel_art_desc") }}
                </div>
              </div>
              <div class="toggle-container">
                <input
                  type="checkbox"
                  id="pixelArt"
                  v-model="graphicsSettings.pixelArt"
                  class="toggle-input"
                />
                <label for="pixelArt" class="toggle-label"></label>
              </div>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.graphics.round_pixels")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.graphics.round_pixels_desc") }}
                </div>
              </div>
              <div class="toggle-container">
                <input
                  type="checkbox"
                  id="roundPixels"
                  v-model="graphicsSettings.roundPixels"
                  class="toggle-input"
                />
                <label for="roundPixels" class="toggle-label"></label>
              </div>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.graphics.power_preference")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.graphics.power_preference_desc") }}
                </div>
              </div>
              <select
                v-model="graphicsSettings.powerPreference"
                class="setting-select"
              >
                <option value="default">default</option>
                <option value="high-performance">high-performance</option>
                <option value="low-power">low-power</option>
              </select>
            </div>

            <div v-if="graphicsError" class="error-message graphics-error">
              {{ graphicsError }}
            </div>
            <div class="save-button-container">
              <button
                class="save-button"
                @click="saveGraphicsSettings"
                :disabled="isLoading"
              >
                {{ $t("settings.save") }}
              </button>
            </div>
          </div>

          <!-- Sounds Tab -->
          <div v-if="activeTab === 'sounds'" class="tab-content">
            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.sounds.scene_sound")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.sounds.scene_sound_desc") }}
                </div>
              </div>
              <div class="toggle-container">
                <input
                  type="checkbox"
                  id="sceneSoundMuted"
                  v-model="soundSettings.sceneSoundMuted"
                  class="toggle-input"
                />
                <label for="sceneSoundMuted" class="toggle-label"></label>
              </div>
            </div>

            <div class="setting-group-row">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t("settings.sounds.scene_volume")
                }}</label>
                <div class="setting-description">
                  {{ $t("settings.sounds.scene_volume_desc") }}
                </div>
              </div>
              <div class="volume-control">
                <input
                  type="range"
                  v-model="soundSettings.sceneVolume"
                  min="0"
                  max="100"
                  step="1"
                  class="volume-slider"
                  :disabled="soundSettings.sceneSoundMuted"
                />
                <span class="volume-value">{{ soundSettings.sceneVolume }}%</span>
              </div>
            </div>

            <div v-if="soundsError" class="error-message sounds-error">
              {{ soundsError }}
            </div>
            <div class="save-button-container">
              <button
                class="save-button"
                @click="saveSoundSettings"
                :disabled="isLoading"
              >
                {{ $t("settings.save") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="confirmation-overlay">
      <div class="confirmation-dialog">
        <h3>{{ $t("settings.confirm.title") }}</h3>
        <p>{{ $t("settings.confirm.message") }}</p>
        <div class="confirmation-buttons">
          <button class="confirm-button" @click="confirmRestart">
            {{ $t("settings.confirm.ok") }}
          </button>
          <button class="cancel-button" @click="cancelRestart">
            {{ $t("settings.confirm.cancel") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import { useLanguageStore } from "@/stores/languageStore";
import { mapStores } from "pinia";

export default {
  emits: ["close"],
  data() {
    return {
      activeTab: "profile",
      showConfirmDialog: false,
      usernameError: null,
      languageError: null,
      graphicsError: null,
      soundsError: null,
      pendingAction: null,
      isLoading: false,
      profileSettings: {
        username: socket.user.username,
        language: socket.user.lang,
      },
      graphicsSettings: {
        renderType: socket.user.phaser_rendering_type,
        antialias: socket.user.phaser_antialias ? true : false,
        antialiasGL: socket.user.phaser_antialias_gl ? true : false,
        pixelArt: socket.user.phaser_pixel_art ? true : false,
        roundPixels: socket.user.phaser_round_pixels ? true : false,
        powerPreference: socket.user.phaser_power_preference,
      },
      soundSettings: {
        sceneVolume: socket.user.phaser_scene_sound_volume || 50,
        sceneSoundMuted: socket.user.phaser_scene_sound_muted ? true : false,
      },
    };
  },
  computed: {
    ...mapStores(useLanguageStore),
  },
  watch: {
    "graphicsSettings.pixelArt"(isPixelArt) {
      if (isPixelArt) {
        this.graphicsSettings.antialias = false;
        this.graphicsSettings.antialiasGL = false;
      }
    },
    "graphicsSettings.antialias"(isAntialias) {
      if (isAntialias) {
        this.graphicsSettings.pixelArt = false;
      }
    },
    "graphicsSettings.antialiasGL"(isAntialiasGL) {
      if (isAntialiasGL) {
        this.graphicsSettings.pixelArt = false;
      }
    },
  },
  methods: {
    saveUsername() {
      this.usernameError = null;
      if (
        this.profileSettings.username &&
        this.profileSettings.username.trim() !== ""
      ) {
        this.pendingAction = "username";
        this.showConfirmDialog = true;
      }
    },
    saveLanguage() {
      this.languageError = null;
      this.pendingAction = "language";
      this.showConfirmDialog = true;
    },
    saveGraphicsSettings() {
      this.graphicsError = null;
      this.pendingAction = "graphics";
      this.showConfirmDialog = true;
    },
    saveSoundSettings() {
      this.soundsError = null;
      this.pendingAction = "sounds";
      this.showConfirmDialog = true;
    },
    confirmRestart() {
      this.isLoading = true;
      switch (this.pendingAction) {
        case "username":
          socket.emit(RequestSocketsEnum.SETTINGS_UPDATE_NAME, {
            username: this.profileSettings.username,
          });
          break;
        case "language":
          socket.emit(RequestSocketsEnum.SETTINGS_UPDATE_LANG, {
            lang: this.profileSettings.language,
          });
          break;
        case "graphics":
          socket.emit(RequestSocketsEnum.SETTINGS_UPDATE_GRAPHICS, {
            graphicsSettings: this.graphicsSettings,
          });
          break;
        case "sounds":
          socket.emit(RequestSocketsEnum.SETTINGS_UPDATE_SOUNDS, {
            soundSettings: this.soundSettings,
          });
          break;
      }
      this.showConfirmDialog = false;
      this.pendingAction = null;
    },
    cancelRestart() {
      this.showConfirmDialog = false;
      this.pendingAction = null;
    },
  },
  created() {
    socket.on(ResponseSocketsEnum.SETTINGS_UPDATE_NAME, (data) => {
      console.log("SettingsUpdateNameController: ", data);
      this.isLoading = false;
      if (data.success) {
        socket.user.username = this.profileSettings.username;
        location.reload();
      } else if (data.error) {
        this.usernameError = data.error;
      } else if (data.message) {
        this.usernameError = data.message;
      }
    });

    socket.on(ResponseSocketsEnum.SETTINGS_UPDATE_LANG, (data) => {
      console.log("SettingsUpdateLangController: ", data);
      this.isLoading = false;
      if (data.success) {
        socket.user.lang = this.profileSettings.language;
        location.reload();
      } else if (data.error) {
        this.languageError = data.error;
      } else if (data.message) {
        this.languageError = data.message;
      }
    });

    socket.on(ResponseSocketsEnum.SETTINGS_UPDATE_GRAPHICS, (data) => {
      console.log("SettingsUpdateGraphicsController: ", data);
      this.isLoading = false;
      if (data.success) {
        location.reload();
      } else if (data.error) {
        this.graphicsError = data.error;
      } else if (data.message) {
        this.graphicsError = data.message;
      }
    });

    socket.on(ResponseSocketsEnum.SETTINGS_UPDATE_SOUNDS, (data) => {
      console.log("SettingsUpdateSoundsController: ", data);
      this.isLoading = false;
      if (data.success) {
        location.reload();
      } else if (data.error) {
        this.soundsError = data.error;
      } else if (data.message) {
        this.soundsError = data.message;
      }
    });
  },
  beforeUnmount() {
    socket.off(ResponseSocketsEnum.SETTINGS_UPDATE_NAME);
    socket.off(ResponseSocketsEnum.SETTINGS_UPDATE_LANG);
    socket.off(ResponseSocketsEnum.SETTINGS_UPDATE_GRAPHICS);
    socket.off(ResponseSocketsEnum.SETTINGS_UPDATE_SOUNDS);
  },
};
</script>

<style scoped>
.settings-popup {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #00000075;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  position: relative;
  border-radius: 5px;
  padding: 20px;
  background-color: #ffffffd9;
  box-shadow: 3px 3px #0000004d;
  width: 800px;
  height: 500px;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  box-shadow: 0 2px #0000004d;
  padding: 0;
  color: black;
}

.main-title {
  text-align: center;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  margin-bottom: 15px;
  box-shadow: 0 3px #0000004d;
}

.settings-container {
  display: flex;
  gap: 20px;
  min-height: 400px;
}

.settings-tabs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 120px;
}

.settings-tab {
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: left;
  font-weight: bold;
  transition: background-color 0.3s ease;
  color: black;
}

.settings-tab.active {
  background-color: #d96b35;
  color: white;
}

.settings-tab:hover:not(.active) {
  background-color: #e0e0e0;
}

.settings-content {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 20px;
  height: 390px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 15px;
}

.input-with-button {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 5px;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 5px;
  width: 100%;
  text-align: left;
}

.save-button-inline {
  background-color: #d96b35;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button-inline:hover:not(:disabled) {
  background-color: #c55a2e;
}

.save-button-inline:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.setting-info {
  flex-basis: 70%;
  text-align: start;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.setting-description {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-bottom: 5px;
}

.setting-input,
.setting-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.3s ease;
  color: black;
}

.setting-input:focus,
.setting-select:focus {
  outline: none;
  border-color: #d96b35;
}

.toggle-container {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-label {
  background-color: #d96b35;
}

.toggle-input:checked + .toggle-label:before {
  transform: translateX(26px);
}

.save-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-button {
  background-color: #d96b35;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button:hover:not(:disabled) {
  background-color: #c55a2e;
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.graphics-error {
  text-align: left;
  margin-bottom: 10px;
}

.confirmation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.confirmation-dialog {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
}

.confirmation-dialog h3 {
  margin-bottom: 15px;
  color: #d96b35;
  font-size: 18px;
}

.confirmation-dialog p {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
}

.confirmation-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.confirm-button {
  background-color: #d96b35;
  color: white;
}

.confirm-button:hover {
  background-color: #c55a2e;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
}

.cancel-button:hover {
  background-color: #bbb;
}

/* Volume Control Styles */
.volume-control {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-basis: 30%;
}

.volume-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d96b35;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d96b35;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}

.volume-slider:hover:not(:disabled)::-webkit-slider-thumb {
  background: #c55a2e;
}

.volume-slider:hover:not(:disabled)::-moz-range-thumb {
  background: #c55a2e;
}

.volume-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
  background: #999;
}

.volume-slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
  background: #999;
}

.volume-value {
  min-width: 40px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  text-align: right;
}

.sounds-error {
  text-align: left;
  margin-bottom: 10px;
}
</style>
