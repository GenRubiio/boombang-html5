<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <RingNpcModalComponent v-if="npcId == NpcEnum.WISE_RING" :npcId="npcId" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import NpcEnum from "../../../../enums/NpcEnum.js";

export default {
  props: {
    npcId: {
      type: Number,
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
      import("../scenes/npc/RingNpcModalComponent.vue")
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
  top: 0px;
  right: 0px;
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: black;
}
</style>
