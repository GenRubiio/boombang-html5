<template>
  <div
    class="chat-item"
    :style="{
      backgroundColor: chat.chat_background_color,
      color: chat.chat_color,
    }"
  >
    <div class="chat-item__icon">
      <img :src="iconUrl" alt="Chat Icon" />
    </div>
    <div class="chat-item__name">{{ chat.name }}:</div>
    <div class="chat-item__text">{{ chat.text }}</div>
  </div>
</template>

<script>
export default {
  props: {
    chat: {
      type: Object,
      required: true,
    },
  },
  computed: {
    iconUrl() {
      // The path is relative to the public directory
      return `/${this.chat.icon}`;
    },
  },
};
</script>

<style scoped>
.chat-item {
  display: flex;
  align-items: center;
  align-self: center;
  align-content: center;
  width: 100%;
  border-radius: 5px;
  position: relative;
  padding: 4px 5px;
  box-sizing: border-box;
}

.chat-item__icon {
  position: absolute;
}

.chat-item__icon img {
  width: 20px;
}

.chat-item__name {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 14px;
  margin-left: 23px;
  margin-top: 2px;
}

.chat-item__text {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: normal;
  font-size: 14px;
  margin-left: 5px;
}
</style>
