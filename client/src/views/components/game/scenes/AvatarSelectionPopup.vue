<template>
  <div
    class="avatar-selection"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
  >
    <button class="close-button" @click="$emit('close-avatar-selection')">
      <i class="las la-times"></i>
    </button>
    <div class="avatar-selection__container">
      <div class="avatar-selection__content">
        <div class="avatar-selection__title">
          {{ $t("avatar_select.gallery_title") }}
        </div>
        <div class="avatar-selection__grid avatars-grid">
          <div
            class="avatar-selection__grid-item"
            v-for="(avatar, index) in paddedAvatars"
            :key="index"
            @click="onSelectAvatar(avatar.key)"
            :class="{
              selected: isAvatarSelected(avatar.key),
              disabled: !isAvatarEnabled(avatar.key),
              'empty-item': !avatar.key,
            }"
          >
            <div class="image-wrapper">
              <div v-if="cooldownActive" class="cooldown-overlay"></div>
              <img v-if="avatar.image" :src="avatar.image" />
            </div>
            <!-- <div
              v-if="avatar.description"
              class="info-icon"
              @mouseover="showTooltip($event, avatar)"
              @mouseleave="hideTooltip"
            >
              ?
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      v-html="tooltip.content"
    ></div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

export default {
  props: {
    authUser: {
      type: Object,
      required: true,
    },
  },
  name: "AvatarSelectionPopup",
  emits: ["close-avatar-selection", "on-select-avatar"],
  data() {
    return {
      avatars: [],
      avatarsLoaded: false,
      selectedAvatarKey: null,
      tooltip: {
        visible: false,
        content: "",
        x: 0,
        y: 0,
      },
      cooldownActive: false,
    };
  },
  computed: {
    paddedAvatars() {
      const totalItems = 15;
      const padded = [...this.avatars];
      while (padded.length < totalItems) {
        padded.push({});
      }
      return padded;
    },
  },
  methods: {
    showTooltip(event, item) {
      if (item && item.description) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (item.description.startsWith("customization.")) {
          this.tooltip.content = this.$t(item.description);
        } else {
          this.tooltip.content = item.description;
        }
        this.tooltip.visible = true;
        this.tooltip.x = rect.left + window.scrollX - rect.width / 2 - 20;
        this.tooltip.y = rect.bottom + window.scrollY + 5;
      }
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    onSelectAvatar(avatarKey) {
      if (this.cooldownActive) return;
      if (!avatarKey || !this.isAvatarEnabled(avatarKey)) {
        return;
      }

      // Don't proceed if clicking on the already selected avatar
      if (this.selectedAvatarKey == avatarKey) {
        return;
      }

      socket.emit(RequestSocketsEnum.USER_CHANGE_AVATAR, {
        avatar: avatarKey,
      });
      socket.off(ResponseSocketsEnum.USER_CHANGE_AVATAR_POPUP);
      socket.on(ResponseSocketsEnum.USER_CHANGE_AVATAR_POPUP, (data) => {
        if (data && data.success) {
          // Actualizar manualmente la selección
          this.selectedAvatarKey = avatarKey;
          socket.user.avatar_id = avatarKey;
          this.triggerCooldown();
        }
      });
    },
    isAvatarEnabled(avatarKey) {
      return this.authUser.avatars
        ? this.authUser.avatars.includes(avatarKey)
        : true;
    },
    isAvatarSelected(avatarKey) {
      return this.selectedAvatarKey == avatarKey;
    },
    triggerCooldown() {
      if (this.cooldownActive) return;
      this.cooldownActive = true;
      setTimeout(() => {
        this.cooldownActive = false;
      }, 2000);
    },
  },
  mounted() {
    // Inicializar la selección actual
    this.selectedAvatarKey = socket.user.avatar_id;

    socket.emit(RequestSocketsEnum.GET_USER_AVATARS);
    socket.off(ResponseSocketsEnum.GET_USER_AVATARS);
    socket.on(ResponseSocketsEnum.GET_USER_AVATARS, (data) => {
      if (data && data.avatars) {
        this.avatars = data.avatars || [];
        this.avatarsLoaded = true;
      }
    });
  },
};
</script>

<style>
@property --a {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes clock-unwipe {
  from {
    --a: 0deg;
  }
  to {
    --a: 360deg;
  }
}

.cooldown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: conic-gradient(
    transparent var(--a),
    rgba(255, 255, 255, 0.7) var(--a)
  );
  animation: clock-unwipe 2s linear forwards;
  z-index: 1;
  border-radius: 5px;
}
</style>

<style scoped>
.avatar-selection {
  width: 600px;
  height: 550px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: absolute;
  right: 351px;
  top: 11px;
  z-index: 101;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 3px 3px #0000004d;
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.805);
  color: white;
  padding: 4px;
  border-radius: 5px;
  z-index: 102;
  pointer-events: none;
  white-space: pre-wrap;
  font-size: 12px;
  text-align: start;
  width: 125px;
}

.tooltip::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 10px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent black transparent;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  color: white;
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

.avatar-selection__container {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  margin-top: 25px;
}

.avatar-selection__content {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.avatar-selection__title {
  text-align: start;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  box-shadow: 0 3px #0000004d;
}

.avatar-selection__grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 10px;
}

.avatars-grid {
  grid-template-columns: repeat(5, 1fr);
}

.avatar-selection__grid-item {
  background-color: #e0e0e0;
  border-radius: 5px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 5px;
  box-sizing: border-box;
  height: 120px;
  cursor: pointer;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.avatar-selection__grid-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info-icon {
  position: absolute;
  top: 3px;
  left: 4px;
  width: 20px;
  height: 20px;
  background-color: black;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 1px 1px #0000004d;
  z-index: 2;
}

.avatar-selection__grid-item.selected {
  border: 2px solid #d96b35;
  box-shadow: 0 0 10px #d96b35;
}

.avatar-selection__grid-item.disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}

.avatar-selection__grid-item.empty-item {
  background-color: #f0f0f0;
  cursor: default;
}
</style>
