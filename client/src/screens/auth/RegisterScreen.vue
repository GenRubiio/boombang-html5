<template>
  <div id="register">
    <div>Registro</div>
    <form @submit.prevent="register">
      <div>
        <input v-model="username" type="text" placeholder="Username" required />
      </div>
      <div>
        <input v-model="email" type="text" placeholder="Email" required />
      </div>
      <div>
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <div>
        <select v-model="avatar_id">
          <option value="1">Boomer</option>
          <option value="2">Brujita</option>
          <option value="3">Cholo</option>
          <option value="4">Empollon</option>
          <option value="5">Gata</option>
          <option value="6">Ghost</option>
          <option value="7">India</option>
          <option value="8">Lilian</option>
          <option value="9">Marsu</option>
          <option value="10">Modern</option>
          <option value="11">Ninja</option>
          <option value="12">Rasta</option>
          <option value="13">Skeleton</option>
          <option value="14">Werewolf</option>
          <option value="15">Wraith</option>
          <option value="16">Yayo</option>
          <option value="17">Zombie</option>
        </select>
      </div>
      <div>
        <button type="submit" :disabled="isRegistering">
          {{ isRegistering ? "Creando..." : "Registrarse" }}
        </button>
      </div>
    </form>
    <button @click="$emit('goToLogin')" :disabled="isRegistering">
      ¿Ya tienes cuenta? Inicia sesión
    </button>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green">{{ successMessage }}</p>
  </div>
</template>

<script>
import RequestSocketsEnum from "../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";

export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      avatar_id: 1,
      avatar_colors: "00000000000000",
      errorMessage: "",
      successMessage: "",
      isRegistering: false, // Nueva propiedad para deshabilitar el botón
    };
  },
  methods: {
    register() {
      this.isRegistering = true;

      this.$socket.emit(RequestSocketsEnum.REGISTER, {
        username: this.username,
        email: this.email,
        password: this.password,
        avatar_id: this.avatar_id,
        avatar_colors: this.avatar_colors,
      });

      this.$socket.off(ResponseSocketsEnum.REGISTER_SUCCESS);
      this.$socket.on(ResponseSocketsEnum.REGISTER_SUCCESS, () => {
        this.successMessage = "Registro exitoso. Ahora puedes iniciar sesión.";
        this.errorMessage = "";
        this.isRegistering = false;
      });

      this.$socket.off(ResponseSocketsEnum.REGISTER_ERROR);
      this.$socket.on(ResponseSocketsEnum.REGISTER_ERROR, (error) => {
        this.errorMessage = error;
        this.successMessage = "";
        this.isRegistering = false;
      });
    },
  },
};
</script>

<style scoped>
#register {
  position: relative;
  z-index: 1;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
}
</style>
