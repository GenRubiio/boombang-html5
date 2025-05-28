import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import socket from './sockets/socket';
import { createPinia } from 'pinia'

const app = createApp(App);
const pinia = createPinia();
app.config.globalProperties.$socket = socket;
app.use(pinia);
app.mount('#app');