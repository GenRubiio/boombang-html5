<template>
  <img :src="avatarImage" alt="Avatar" />
</template>

<script>
import asset_boomerFichaImage from "../../../../../assets/game/avatars/boomer/ficha.svg";
import asset_brujitaFichaImage from "../../../../../assets/game/avatars/brujita/ficha.svg";
import asset_choloFichaImage from "../../../../../assets/game/avatars/cholo/ficha.svg";
import asset_empollonFichaImage from "../../../../../assets/game/avatars/empollon/ficha.svg";
import asset_gataFichaImage from "../../../../../assets/game/avatars/gata/ficha.svg";
import asset_ghostFichaImage from "../../../../../assets/game/avatars/ghost/ficha.svg";
import asset_indiaFichaImage from "../../../../../assets/game/avatars/india/ficha.svg";
import asset_lilianFichaImage from "../../../../../assets/game/avatars/lilian/ficha.svg";
import asset_marsuFichaImage from "../../../../../assets/game/avatars/marsu/ficha.svg";
import asset_modernFichaImage from "../../../../../assets/game/avatars/modern/ficha.svg";
import asset_ninjaFichaImage from "../../../../../assets/game/avatars/ninja/ficha.svg";
import asset_rastaFichaImage from "../../../../../assets/game/avatars/rasta/ficha.svg";
import asset_skeletonFichaImage from "../../../../../assets/game/avatars/skeleton/ficha.svg";
import asset_werewolfFichaImage from "../../../../../assets/game/avatars/werewolf/ficha.svg";
import asset_wraithFichaImage from "../../../../../assets/game/avatars/wraith/ficha.svg";
import asset_yayoFichaImage from "../../../../../assets/game/avatars/yayo/ficha.svg";
import asset_zombieFichaImage from "../../../../../assets/game/avatars/zombie/ficha.svg";

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
        1: asset_boomerFichaImage,
        2: asset_brujitaFichaImage,
        3: asset_choloFichaImage,
        4: asset_empollonFichaImage,
        5: asset_gataFichaImage,
        6: asset_ghostFichaImage,
        7: asset_indiaFichaImage,
        8: asset_lilianFichaImage,
        9: asset_marsuFichaImage,
        10: asset_modernFichaImage,
        11: asset_ninjaFichaImage,
        12: asset_rastaFichaImage,
        13: asset_skeletonFichaImage,
        14: asset_werewolfFichaImage,
        15: asset_wraithFichaImage,
        16: asset_yayoFichaImage,
        17: asset_zombieFichaImage,
      };

      return avatarMap[this.avatarId] || ""; // Devuelve un string vacío si no hay avatar encontrado
    },
  },
};
</script>

<style scoped></style>
