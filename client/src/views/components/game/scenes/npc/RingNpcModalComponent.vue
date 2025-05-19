<template>
  <div class="modal-info">
    <h2>¡Bienvenido al Ring!</h2>
    <p>
      Aquí podrás participar en emocionantes combates y demostrar tus
      habilidades. ¡Prepárate para la acción!
    </p>
    <p class="alert-search" v-if="isSubscribed">Emparejamiento en curso...</p>
    <div class="modal-info__buttons">
      <button
        @click="onToggle"
        :class="['btn-subscribe', { unsub: isSubscribed }]"
      >
        {{ isSubscribed ? "Cancelar..." : "Inscribirme" }}
      </button>
    </div>
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
import socket from "../../../../../sockets/socket";
import { useNpcSubscriptionStore } from "../../../../../stores/npcSubscription";

export default {
  props: {
    npcId: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    // Calcula si está inscrito llamando al getter del store
    isSubscribed() {
      const store = useNpcSubscriptionStore();
      return store.isSubscribed(this.npcId);
    },
  },
  methods: {
    onToggle() {
      socket.emit("request:minigame_subscribe", {
        type: this.npcId,
      });

      socket.off("response:minigame_subscribe");
      socket.on("response:minigame_subscribe", (response) => {
        if (response.success) {
          const store = useNpcSubscriptionStore();
          store.toggle(this.npcId);
        }
      });
    },
  },
};
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

.alert-search {
  color: #d96b35 !important;
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

.modal-info__buttons {
  margin-top: 10px;
  margin-bottom: 10px;
}

.btn-subscribe {
  display: inline-block;
  padding: 10px 20px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid #0072c6;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: linear-gradient(to bottom, #6bd0fa 0%, #008ed6 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: opacity 0.2s, transform 0.2s;
}

.btn-subscribe:hover {
  opacity: 0.9;
}

.btn-subscribe:active {
  opacity: 0.8;
}
</style>
