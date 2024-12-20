<template>
  <div id="register">
    <h1>Registro</h1>
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
        <button type="submit">Registrarse</button>
      </div>
    </form>
    <button @click="$emit('goToLogin')">
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
      password: "13021998Gen",
      avatar_id: 1,
      avatar_colors: "00000000000000",
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
    register() {
      this.$socket.off(RequestSocketsEnum.REGISTER);
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
      });

      this.$socket.off(ResponseSocketsEnum.REGISTER_ERROR);
      this.$socket.on(ResponseSocketsEnum.REGISTER_ERROR, (error) => {
        this.errorMessage = error;
        this.successMessage = "";
      });
    },
  },
};
</script>

<style scoped>
/* Estilos */
</style>
