<template>
  <div class="container">
    <div>
      <img :src="laughter_1" alt="Laughter 1" />
    </div>
    <div>
      <img :src="laughter_2" alt="Laughter 2" />
    </div>
    <div>
      <img :src="cry" alt="Cry" />
    </div>
    <div>
      <img :src="love" alt="Love" />
    </div>
    <div>
      <img :src="spit" alt="Spit" />
    </div>
    <div>
      <img :src="fart" alt="Fart" />
    </div>
    <div>
      <img :src="provoke" alt="Provoke" />
    </div>
    <div>
      <img :src="fly" alt="Fly" />
    </div>
  </div>
</template>

<script>
import laughter_1 from "../../../../assets/game/emojis/laughter_1.png";
import laughter_2 from "../../../../assets/game/emojis/laughter_2.png";
import cry from "../../../../assets/game/emojis/cry.png";
import love from "../../../../assets/game/emojis/love.png";
import spit from "../../../../assets/game/emojis/spit.png";
import fart from "../../../../assets/game/emojis/fart.png";
import provoke from "../../../../assets/game/emojis/provoke.png";
import fly from "../../../../assets/game/emojis/fly.png";

export default {
  data() {
    return {
      laughter_1,
      laughter_2,
      cry,
      love,
      spit,
      fart,
      provoke,
      fly,
    };
  },
  methods: {},
  computed: {},
};
</script>

<style scoped>
.container {
  background-color: white;
  border-radius: 8px;
  margin: 10px auto 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Siempre 4 columnas */
  grid-template-rows: repeat(2, 1fr); /* Siempre 4 filas */
  max-width: 400px; /* Evita que el grid se expanda más allá */
  width: 100%;
  box-sizing: border-box;
}

.container div {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.container img {
  max-width: 100%; /* Ajusta el tamaño de las imágenes */
  height: auto;
  display: block;
}

.container div:hover img {
  opacity: 0.5; /* Reduce la opacidad al 50% al pasar el cursor */
  transition: opacity 0.3s ease-in-out; /* Transición suave */
}
</style>
