<template>
  <div class="container" :class="colorUser">
    <div class="container__uppers-data">
      <div class="container__uppers-data__title">Uppercuts</div>
      <div class="container__uppers-data__data-container">
        <div class="container__uppers-data__data-container__count">
          {{ user.uppercuts_send }}
        </div>
        <div class="container__uppers-data__data-container__title">
          Enviados
        </div>
      </div>
      <div class="container__uppers-data__data-container">
        <div class="container__uppers-data__data-container__count">
          {{ user.uppercuts_received }}
        </div>
        <div class="container__uppers-data__data-container__title">
          Recibidos
        </div>
      </div>
    </div>
    <div class="container__uppers-right">
      <img :src="red_upper" alt="upper" />
    </div>
  </div>
</template>

<script>
import red_upper from "../../../../../../assets/game/ficha/uppercuts/red.png";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      red_upper,
    };
  },
  methods: {},
  computed: {
    colorUser() {
      if (this.user.is_admin) {
        return "admin";
      }
      if (this.user.is_vip) {
        return "vip";
      }
      return this.user.is_selected ? "selected" : "user";
    },
  },
  mounted() {
    console.log("User data received in component:", this.user);
  },
};
</script>

<style scoped>
.container {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  max-width: 400px; /* Evita que el grid se expanda más allá */
  width: 100%;
  box-sizing: border-box;
  height: 90px;
  position: relative;
  z-index: 0;
  display: flex;
}

.container__uppers-data {
  padding: 8px;
  width: 120px;
}

.container__uppers-right {
  padding-top: 15px;
}

.container__uppers-data__title {
  width: 100%;
  font-size: 18px;
  font-weight: bold;
  color: white;
  padding: 0 3px;
  border-radius: 5px;
  text-align: start;
  box-sizing: border-box;
}

.container.user .container__uppers-data__title {
  background-color: #005491;
}

.container.selected .container__uppers-data__title {
  background-color: #045d03;
}

.container__uppers-data__data-container {
  width: 100%;
  margin-top: 5px;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.container__uppers-data__data-container__count {
  font-size: 11px;
  font-weight: bold;
  color: white;
  padding: 0 5px;
  border-radius: 5px;
  text-align: center;
  height: 17px;
  width: 33px;
}

.container.user .container__uppers-data__data-container__count {
  background-color: #005491;
}

.container.selected .container__uppers-data__data-container__count {
  background-color: #045d03;
}

.container__uppers-data__data-container__title {
  font-size: 11px;
  font-weight: bold;
  color: white;
  padding: 0 5px;
  border-radius: 5px;
  text-align: start;
  height: 17px;
  width: 63px;
}

.container.user .container__uppers-data__data-container__title {
  background-color: #005491;
}

.container.selected .container__uppers-data__data-container__title {
  background-color: #045d03;
}
</style>
