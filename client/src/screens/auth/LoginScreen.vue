<template>
  <div id="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <button @click="$emit('goToRegister')">¿No tienes cuenta? Regístrate</button>
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
  </div>
</template>

<script>
import RequestSocketsEnum from "../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";

export default {
  data() {
    return {
      username: 'Gen',
      password: '13021998Gen',
      errorMessage: '',
    };
  },
  methods: {
    login() {
      this.$socket.off(RequestSocketsEnum.LOGIN);
      this.$socket.emit(RequestSocketsEnum.LOGIN, { username: this.username, password: this.password });

      this.$socket.off(ResponseSocketsEnum.LOGIN_SUCCESS);
      this.$socket.on(ResponseSocketsEnum.LOGIN_SUCCESS, (data) => {
        //alert(`Bienvenido, ${data.user.username}`);
        this.$socket.user = data.user;
        this.$emit('loginSuccess');
      });

      this.$socket.off(ResponseSocketsEnum.LOGIN_ERROR);
      this.$socket.on(ResponseSocketsEnum.LOGIN_ERROR, (error) => {
        //this.errorMessage = error;
        console.log(error);
      });
    },
  },
};
</script>

<style scoped>
/* Estiliza tu formulario aquí */
</style>
