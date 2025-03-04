<template>
  <div class="container">
    <div class="container__uppers-data">
      <div class="container__uppers-data__title">Uppercuts</div>
      <div class="container__uppers-data__data-container">
        <div class="container__uppers-data__data-container__count">1000</div>
        <div class="container__uppers-data__data-container__title">
          Enviados
        </div>
      </div>
      <div class="container__uppers-data__data-container">
        <div class="container__uppers-data__data-container__count">1000</div>
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
  data() {
    return {
      red_upper,
    };
  },
  methods: {},
  computed: {},
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

.container__uppers-right{
  padding-top: 15px;
}

.container__uppers-data__title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #005491;
  padding: 0 3px;
  border-radius: 5px;
  text-align: start;
}

.container__uppers-data__data-container{
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.container__uppers-data__data-container__count{
  font-size: 11px;
  font-weight: bold;
  color: white;
  background-color: #005491;
  padding: 0 5px;
  border-radius: 5px;
  text-align: center;
  height: 17px;
  width: 33px;
}

.container__uppers-data__data-container__title{
  font-size: 11px;
  font-weight: bold;
  color: white;
  background-color: #005491;
  padding: 0 5px;
  border-radius: 5px;
  text-align: start;
  height: 17px;
  width: 63px;
}
</style>
