import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import socket from './sockets/socket';

const app = createApp(App);
app.config.globalProperties.$socket = socket;
app.mount('#app');