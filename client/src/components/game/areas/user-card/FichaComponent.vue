<template>
  <img :src="avatarImage" alt="Avatar" />
</template>

<script>
import boomerFicha from "../../../../assets/game/avatars/boomer/ficha.svg";
import brujitaFicha from "../../../../assets/game/avatars/brujita/ficha.svg";
import choloFicha from "../../../../assets/game/avatars/cholo/ficha.svg";
import empollonFicha from "../../../../assets/game/avatars/empollon/ficha.svg";
import gataFicha from "../../../../assets/game/avatars/gata/ficha.svg";
import ghostFicha from "../../../../assets/game/avatars/ghost/ficha.svg";
import indiaFicha from "../../../../assets/game/avatars/india/ficha.svg";
import lilianFicha from "../../../../assets/game/avatars/lilian/ficha.svg";
import marsuFicha from "../../../../assets/game/avatars/marsu/ficha.svg";
import modernFicha from "../../../../assets/game/avatars/modern/ficha.svg";
import ninjaFicha from "../../../../assets/game/avatars/ninja/ficha.svg";
import rastaFicha from "../../../../assets/game/avatars/rasta/ficha.svg";
import skeletonFicha from "../../../../assets/game/avatars/skeleton/ficha.svg";
import werewolfFicha from "../../../../assets/game/avatars/werewolf/ficha.svg";
import wraithFicha from "../../../../assets/game/avatars/wraith/ficha.svg";
import yayoFicha from "../../../../assets/game/avatars/yayo/ficha.svg";
import zombieFicha from "../../../../assets/game/avatars/zombie/ficha.svg";

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
        1: boomerFicha,
        2: brujitaFicha,
        3: choloFicha,
        4: empollonFicha,
        5: gataFicha,
        6: ghostFicha,
        7: indiaFicha,
        8: lilianFicha,
        9: marsuFicha,
        10: modernFicha,
        11: ninjaFicha,
        12: rastaFicha,
        13: skeletonFicha,
        14: werewolfFicha,
        15: wraithFicha,
        16: yayoFicha,
        17: zombieFicha,
      };

      return avatarMap[this.avatarId] || ""; // Devuelve un string vacío si no hay avatar encontrado
    },
  },
};
</script>

<style scoped></style>
