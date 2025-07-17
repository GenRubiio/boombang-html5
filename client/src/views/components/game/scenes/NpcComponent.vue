<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <RingNpcModalComponent v-if="npcId == NpcEnum.WISE_RING" :npcId="npcId"/>
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
  margin: 5px;
  pointer-events: auto;
}
.modal-content {
  width: 336px;
  background: #fffffffa;
  padding: 10px;
  border-radius: 0.5rem;
  position: relative;
  user-select: none;
}
.close-btn {
  position: absolute;
  top: 0px;
  right: 0px;
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
