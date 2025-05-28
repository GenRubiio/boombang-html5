<template>
  <div class="alert">
    <div v-if="alertType === MinigameAlertsEnum.WIN">
      <h1>El vencedor es {{ winnerName }}</h1>
      <p>Ha ganado el ring y obtiene 100 créditos de oro y una victoria.</p>
    </div>
    <div v-else-if="alertType === MinigameAlertsEnum.NO_MIN_USERS">
      <h1>¡No hay suficientes jugadores!</h1>
      <p>Se necesitan al menos 2 jugadores para iniciar el juego.</p>
    </div>
    <div v-else-if="alertType === MinigameAlertsEnum.TIMEOUT">
      <h1>¡Tiempo agotado!</h1>
      <p>El juego ha terminado por falta de tiempo.</p>
    </div>
  </div>
</template>

<script>
import MinigameAlertsEnum from "../../../../enums/MinigameAlertsEnum.js";

export default {
  props: {
    alertType: {
      type: String,
      required: true,
    },
    winnerName: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      MinigameAlertsEnum,
    };
  },
};
</script>

<style scoped>
.alert {
  position: absolute;
  background-color: #ffffffd9;
  margin: 10px;
  color: white;
  padding: 10px;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-family: sans-serif;
  text-align: start;
  border-radius: 5px;
  color: black;
  width: 400px;
}

.alert h1 {
  font-size: 24px;
  margin: 0;
  color: #ee6334;
}

.alert p {
  font-size: 18px;
  margin: 0;
  color: #fc9d00;
}
</style>
