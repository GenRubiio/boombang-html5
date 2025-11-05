<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')"><i class="las la-times"></i></button>
      <RingNpcModalComponent v-if="npcId == NpcEnum.WISE_RING" :npcId="npcId" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import NpcEnum from "../../../../../enums/NpcEnum.js";

export default {
  props: {
    npcId: {
      type: Number,
      required: true,
    },
    npcType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      NpcEnum,
    };
  },
  components: {
    RingNpcModalComponent: defineAsyncComponent(() =>
      import("../npc/RingNpcModalComponent.vue")
    ),
  },
};
</script>

<style>
.modal-overlay {
  display: flex;
  justify-content: end;
  align-items: center;
  margin: 0;
  pointer-events: auto;
  position: relative;
  z-index: 101;
}
.modal-content {
  width: 360px;
  background: #fffffffa;
  padding: 10px;
  border-radius: 5px;
  position: relative;
  user-select: none;
  box-shadow: 3px 3px #0000004d;
  margin: 5px 11px;
}
.close-btn {
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
</style>
