<template>
  <div id="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
  </div>
</template>

<script>
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
      this.$socket.emit('login', { username: this.username, password: this.password });

      this.$socket.off('login_success');
      this.$socket.on('login_success', (data) => {
        //alert(`Bienvenido, ${data.user.username}`);
        this.$emit('loginSuccess');
      });

      this.$socket.on('login_error', (error) => {
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
