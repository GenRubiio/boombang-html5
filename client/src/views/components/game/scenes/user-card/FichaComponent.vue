<template>
  <img :src="avatarImage" alt="Avatar" />
</template>

<script>
import asset_boomer_ficha_image from "@/assets/game/avatars/boomer/ficha.svg";
import asset_brujita_ficha_image from "@/assets/game/avatars/brujita/ficha.svg";
import asset_cholo_ficha_image from "@/assets/game/avatars/cholo/ficha.svg";
import asset_empollon_ficha_image from "@/assets/game/avatars/empollon/ficha.svg";
import asset_gata_ficha_image from "@/assets/game/avatars/gata/ficha.svg";
import asset_ghost_ficha_image from "@/assets/game/avatars/ghost/ficha.svg";
import asset_india_ficha_image from "@/assets/game/avatars/india/ficha.svg";
import asset_lilian_ficha_image from "@/assets/game/avatars/lilian/ficha.svg";
import asset_marsu_ficha_image from "@/assets/game/avatars/marsu/ficha.svg";
import asset_modern_ficha_image from "@/assets/game/avatars/modern/ficha.svg";
import asset_ninja_ficha_image from "@/assets/game/avatars/ninja/ficha.svg";
import asset_rasta_ficha_image from "@/assets/game/avatars/rasta/ficha.svg";
import asset_skeleton_ficha_image from "@/assets/game/avatars/skeleton/ficha.svg";
import asset_werewolf_ficha_image from "@/assets/game/avatars/werewolf/ficha.svg";
import asset_wraith_ficha_image from "@/assets/game/avatars/wraith/ficha.svg";
import asset_yayo_ficha_image from "@/assets/game/avatars/yayo/ficha.svg";
import asset_zombie_ficha_image from "@/assets/game/avatars/zombie/ficha.svg";

export default {
  props: {
    avatarId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    avatarImage() {
      const avatarMap = {
        1: asset_boomer_ficha_image,
        2: asset_brujita_ficha_image,
        3: asset_cholo_ficha_image,
        4: asset_empollon_ficha_image,
        5: asset_gata_ficha_image,
        6: asset_ghost_ficha_image,
        7: asset_india_ficha_image,
        8: asset_lilian_ficha_image,
        9: asset_marsu_ficha_image,
        10: asset_modern_ficha_image,
        11: asset_ninja_ficha_image,
        12: asset_rasta_ficha_image,
        13: asset_skeleton_ficha_image,
        14: asset_werewolf_ficha_image,
        15: asset_wraith_ficha_image,
        16: asset_yayo_ficha_image,
        17: asset_zombie_ficha_image,
      };

      return avatarMap[this.avatarId] || ""; // Devuelve un string vacío si no hay avatar encontrado
    },
  },
};
</script>

<style scoped></style>
