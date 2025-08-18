<template>
  <div class="maintenance">
    <div class="maintenance__content">
      <h1 class="maintenance__title">{{ $t('maintenance.title') }}</h1>
      <p class="maintenance__description" v-html="$t('maintenance.description')"></p>
      <img :src="asset_maintenance_avatar_image" alt="Mantenimiento" />
    </div>
  </div>
</template>

<script>
import asset_maintenance_avatar_image from "@/assets/game/auth/maintenance-avatar.webp";

export default {
  data() {
    return {
      asset_maintenance_avatar_image,
    };
  },
  methods: {},
  mounted() {},
};
</script>

<style scoped>
.maintenance {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.maintenance__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: gold;
  background: linear-gradient(to bottom, #0d97f1 0%, #003d6c 100%);
  border-radius: 10px;
  padding: 20px;
  height: 280px;
  width: 540px;
}

.maintenance__title {
  font-size: 2rem;
  margin-bottom: 10px;
}

.maintenance__description {
  font-size: 1.2rem;
  color: white;
}
</style>
