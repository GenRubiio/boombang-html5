<template>
  <div class="modal-info">
    <h2>¡Bienvenido al Ring!</h2>
    <p>
      Aquí podrás participar en emocionantes combates y demostrar tus
      habilidades. ¡Prepárate para la acción!
    </p>
    <p>********************************************************</p>
    <p>Gana puntos compitiendo y desbloquea los siguentes guantes:</p>
    <div class="modal-info__grid">
      <div>
        <p>Rojo = 0 Victorias</p>
      </div>
      <div>
        <p>Blanco = 100 Victorias</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
.modal-info {
  text-align: start;
  color: #fd9a03;
  padding-top: 18px;
}

.modal-info h2 {
  font-size: 28px;
  font-weight: bold;
  color: #d96b35;
  padding: 0;
  margin: 0;
}

.modal-info p {
  font-size: 14px;
  color: #fd9900;
  padding: 0;
  margin: 0;
  margin-top: 5px;
  line-height: 1.2;
}

.modal-info__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.modal-info__grid div {
  background-color: #fd9a03;
  padding: 8px;
  border-radius: 5px;
  text-align: center;
}

.modal-info__grid div p {
  color: white;
  padding: 0;
  margin: 0;
  font-weight: bold;
  font-size: 12px;
}
</style>
