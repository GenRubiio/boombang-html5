<template>
  <div v-if="showTutorial" class="lobby-tutorial">
    <!-- Overlay que bloquea interacciones -->
    <div class="lobby-tutorial__overlay"></div>

    <!-- Contenedor del tutorial -->
    <div class="lobby-tutorial__content">
      <!-- Flecha eliminada según solicitud -->

      <!-- Highlight del elemento actual -->
      <div
        v-if="targetElement && currentStep.showHighlight"
        class="lobby-tutorial__highlight"
        :class="`lobby-tutorial__highlight--${currentStep.id}`"
        :style="highlightStyle"
      ></div>

      <!-- Caja de diálogo -->
      <div
        class="lobby-tutorial__dialog"
        :class="`lobby-tutorial__dialog--${currentStep.id}`"
        :style="dialogStyle"
      >
        <div class="lobby-tutorial__dialog-header">
          <h3>{{ currentStep.title }}</h3>
        </div>
        <div class="lobby-tutorial__dialog-body">
          <p v-html="currentStep.text"></p>
        </div>
        <div class="lobby-tutorial__dialog-footer">
          <button
            v-if="currentStepIndex > 0"
            @click="previousStep"
            class="lobby-tutorial__btn lobby-tutorial__btn--secondary"
          >
            {{ $t("tutorial.previous") }}
          </button>
          <button
            v-if="currentStepIndex < tutorialSteps.length - 1"
            @click="nextStep"
            class="lobby-tutorial__btn lobby-tutorial__btn--primary"
          >
            {{ $t("tutorial.next") }}
          </button>
          <button
            v-else
            @click="completeTutorial"
            class="lobby-tutorial__btn lobby-tutorial__btn--primary"
          >
            {{ $t("tutorial.finish") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

export default {
  name: "LobbyTutorialComponent",
  data() {
    return {
      showTutorial: false,
      currentStepIndex: 0,
      targetElement: null,
      tutorialSteps: [],
    };
  },
  computed: {
    currentStep() {
      return this.tutorialSteps[this.currentStepIndex];
    },

    highlightStyle() {
      if (!this.targetElement) return {};

      const rect = this.targetElement.getBoundingClientRect();

      return {
        "--default-highlight-width": `${rect.width + 10}px`,
        "--default-highlight-height": `${rect.height + 10}px`,
        "--default-highlight-left": `${rect.left - 5}px`,
        "--default-highlight-top": `${rect.top - 5}px`,
        position: "absolute",
        pointerEvents: "none",
        zIndex: 10001,
        animation: "pulse 2s infinite",
      };
    },
    dialogStyle() {
      // Valores por defecto que pueden ser sobrescritos por CSS
      const defaultWidth = 320;
      const defaultHeight = 220;

      if (!this.currentStep.selector || !this.targetElement) {
        // Dialog estilo Genshin Impact para pasos sin selector (historia)
        return {
          "--default-width": `${defaultWidth}px`,
          "--default-left": "50%",
          "--default-top": "auto",
          "--default-bottom": "10px",
          "--default-transform": "translateX(-50%)",
          position: "absolute",
          zIndex: 10003,
        };
      }

      const rect = this.targetElement.getBoundingClientRect();

      let left, top;

      switch (this.currentStep.dialogPosition) {
        case "right":
          left = rect.right + 20;
          top = rect.top + rect.height / 2 - defaultHeight / 2;
          break;
        case "left":
          left = rect.left - defaultWidth - 20;
          top = rect.top + rect.height / 2 - defaultHeight / 2;
          break;
        case "bottom":
          left = rect.left + rect.width / 2 - defaultWidth / 2;
          top = rect.bottom + 20;
          break;
        case "top":
          left = rect.left + rect.width / 2 - defaultWidth / 2;
          top = rect.top - defaultHeight - 20;
          break;
        default:
          left = rect.right + 20;
          top = rect.top + rect.height / 2 - defaultHeight / 2;
      }

      // Convertir coordenadas absolutas a relativas al contenedor del tutorial
      const tutorialContainer = this.$el;
      const tutorialRect = tutorialContainer
        ? tutorialContainer.getBoundingClientRect()
        : { left: 0, top: 0 };

      const relativeLeft = left - tutorialRect.left;
      const relativeTop = top - tutorialRect.top;

      // Asegurar que el diálogo esté dentro del contenedor del juego (1012x657)
      const minLeft = 10;
      const maxLeft = 1012 - defaultWidth - 10;
      const minTop = 10;
      const maxTop = 657 - defaultHeight - 10;

      const finalLeft = Math.max(minLeft, Math.min(relativeLeft, maxLeft));
      const finalTop = Math.max(minTop, Math.min(relativeTop, maxTop));

      return {
        "--default-width": `${defaultWidth}px`,
        "--default-left": `${finalLeft}px`,
        "--default-top": `${finalTop}px`,
        "--default-bottom": "auto",
        "--default-transform": "none",
        position: "absolute",
        zIndex: 10003,
      };
    },
  },
  mounted() {
    this.initializeTutorialSteps();

    // Escuchar eventos de socket para datos del usuario
    socket.on("USER_DATA_UPDATED", () => {
      this.checkUserTutorialStatus();
    });

    // Verificar inmediatamente si hay datos de usuario disponibles
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkUserTutorialStatus();
      }, 1000); // Dar tiempo para que se carguen los datos del usuario
    });

    // También agregar un listener para tutorial forzado (para testing)
    window.startLobbyTutorial = () => {
      this.startTutorial();
    };
  },
  methods: {
    initializeTutorialSteps() {
      this.tutorialSteps = [
        // Historia inicial - estilo Genshin Impact
        {
          id: "intro-1",
          title: this.$t("tutorial.story.title"),
          text: this.$t("tutorial.story.intro1"),
          selector: null,
          showHighlight: false,
          dialogPosition: "bottom",
          cssClass: "intro-story",
        },
        {
          id: "intro-2",
          title: this.$t("tutorial.story.title"),
          text: this.$t("tutorial.story.intro2"),
          selector: null,
          showHighlight: false,
          dialogPosition: "bottom",
          cssClass: "intro-story",
        },
        {
          id: "intro-3",
          title: this.$t("tutorial.story.title"),
          text: this.$t("tutorial.story.intro3"),
          selector: null,
          showHighlight: false,
          dialogPosition: "bottom",
          cssClass: "intro-story",
        },
        // Elementos del lobby
        {
          id: "scenes-container",
          title: this.$t("tutorial.lobby.scenes_title"),
          text: this.$t("tutorial.lobby.scenes_text"),
          selector: ".lobby__scenes-container",
          showHighlight: true,
          dialogPosition: "right",
          cssClass: "scenes-tutorial",
        },
        {
          id: "scene-item",
          title: this.$t("tutorial.lobby.scene_item_title"),
          text: this.$t("tutorial.lobby.scene_item_text"),
          selector: ".scene-item",
          showHighlight: true,
          dialogPosition: "right",
          cssClass: "scene-item-tutorial",
        },
        {
          id: "user-count",
          title: this.$t("tutorial.lobby.user_count_title"),
          text: this.$t("tutorial.lobby.user_count_text"),
          selector: ".user-count",
          showHighlight: true,
          dialogPosition: "right",
          cssClass: "user-count-tutorial",
        },
        {
          id: "credits-component",
          title: this.$t("tutorial.lobby.credits_title"),
          text: this.$t("tutorial.lobby.credits_text"),
          selector: ".credits-component",
          showHighlight: true,
          dialogPosition: "left",
          cssClass: "credits-tutorial",
        },
        {
          id: "game-layer",
          title: this.$t("tutorial.lobby.gachapon_title"),
          text: this.$t("tutorial.lobby.gachapon_text"),
          selector: ".lobby__gachapon",
          showHighlight: true,
          dialogPosition: "left",
          cssClass: "gachapon-tutorial",
        },
        {
          id: "lobby-mail",
          title: this.$t("tutorial.lobby.mail_title"),
          text: this.$t("tutorial.lobby.mail_text"),
          selector: ".lobby__mail",
          showHighlight: true,
          dialogPosition: "left",
          cssClass: "mail-tutorial",
        },
        {
          id: "lobby-settings",
          title: this.$t("tutorial.lobby.settings_title"),
          text: this.$t("tutorial.lobby.settings_text"),
          selector: ".lobby__settings",
          showHighlight: true,
          dialogPosition: "left",
          cssClass: "settings-tutorial",
        },
        {
          id: "lobby-logout",
          title: this.$t("tutorial.lobby.logout_title"),
          text: this.$t("tutorial.lobby.logout_text"),
          selector: ".lobby__logout",
          showHighlight: true,
          dialogPosition: "left",
          cssClass: "logout-tutorial",
        },
      ];
    },
    checkUserTutorialStatus() {
      // Verificar si el usuario necesita tutorial basado en lobby_tutorial
      // Intentar múltiples formas de acceder a los datos del usuario
      const userData = this.$socket?.user || socket.user || window.socket?.user;

      if (userData && userData.lobby_tutorial === false && !this.showTutorial) {
        console.log(
          "🎓 Iniciando tutorial del lobby para el usuario:",
          userData.username
        );
        this.startTutorial();
      }
    },
    startTutorial() {
      this.showTutorial = true;
      this.currentStepIndex = 0;
      this.updateTargetElement();
    },
    nextStep() {
      if (this.currentStepIndex < this.tutorialSteps.length - 1) {
        this.currentStepIndex++;
        this.updateTargetElement();
      }
    },
    previousStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        this.updateTargetElement();
      }
    },
    completeTutorial() {
      this.showTutorial = false;

      console.log("✅ Tutorial del lobby completado");

      // Marcar tutorial como completado en el servidor
      socket.emit(RequestSocketsEnum.COMPLETE_LOBBY_TUTORIAL);

      // Actualizar datos locales del usuario en todas las formas posibles
      const userData = this.$socket?.user || socket.user || window.socket?.user;
      if (userData) {
        userData.lobby_tutorial = true;
      }
      if (this.$socket?.user) {
        this.$socket.user.lobby_tutorial = true;
      }
      if (socket.user) {
        socket.user.lobby_tutorial = true;
      }
    },
    updateTargetElement() {
      this.$nextTick(() => {
        if (this.currentStep.selector) {
          // Buscar el elemento con un pequeño delay para asegurar que el DOM esté actualizado
          setTimeout(() => {
            this.targetElement = document.querySelector(
              this.currentStep.selector
            );
            if (!this.targetElement) {
              console.warn(
                `Tutorial: No se encontró elemento con selector: ${this.currentStep.selector}`
              );
            }
          }, 100);
        } else {
          this.targetElement = null;
        }
      });
    },
  },
  beforeUnmount() {
    // Limpiar eventos si es necesario
    socket.off("USER_DATA_UPDATED");

    // Remover función global
    if (window.startLobbyTutorial) {
      delete window.startLobbyTutorial;
    }
  },
};
</script>

<style scoped>
.lobby-tutorial {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  max-width: 1012px;
  max-height: 657px;
}

.lobby-tutorial__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 30%);
  z-index: 9999;
}

.lobby-tutorial__content {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.lobby-tutorial__highlight {
  background: transparent;
  border: var(--highlight-border-width, 3px) solid
    var(--highlight-border-color, #f1c40f);
  border-radius: var(--highlight-border-radius, 8px);
  box-shadow: 0 0 20px var(--highlight-shadow-color, rgba(241, 196, 15, 0.6)),
    inset 0 0 20px var(--highlight-inner-shadow, rgba(241, 196, 15, 0.1));

  /* Variables para tamaño del highlight */
  width: var(
    --highlight-width,
    var(--default-highlight-width, auto)
  ) !important;
  height: var(
    --highlight-height,
    var(--default-highlight-height, auto)
  ) !important;
  left: var(--highlight-left, var(--default-highlight-left, auto)) !important;
  top: var(--highlight-top, var(--default-highlight-top, auto)) !important;

  /* Variables para offset del highlight */
  margin-left: var(--highlight-offset-x, 0px) !important;
  margin-top: var(--highlight-offset-y, 0px) !important;
  transform: var(--highlight-transform, none) !important;
}

.lobby-tutorial__dialog {
  pointer-events: auto;
  background-color: #3c87b3ad;
  border-radius: 10px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
  color: white;
  min-height: 160px;
  border: 2px solid rgba(60, 135, 179, 0.8);
  backdrop-filter: blur(8px);
  overflow: hidden;
  transition: all 0.3s ease;

  /* Variables CSS que pueden ser sobrescritas por cada clase específica */
  width: var(--dialog-width, var(--default-width, 320px));
  left: var(--dialog-left, var(--default-left, auto)) !important;
  top: var(--dialog-top, var(--default-top, auto)) !important;
  bottom: var(--dialog-bottom, var(--default-bottom, auto)) !important;
  transform: var(--dialog-transform, var(--default-transform, none)) !important;
}

.lobby-tutorial__dialog-header {
  padding: 10px 25px 10px;
  border-bottom: 1px solid #1c2c35ad;
  background-color: #1c2c35ad;
}

.lobby-tutorial__dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.lobby-tutorial__dialog-body {
  padding: 25px;
  flex: 1;
  background-color: #2b5973ad;
}

.lobby-tutorial__dialog-body p {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.lobby-tutorial__dialog-footer {
  padding: 10px 25px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #1c2c35ad;
  background-color: #1c2c35ad;
}

.lobby-tutorial__btn {
  padding: 6px 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lobby-tutorial__btn--primary {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(243, 156, 18, 0.3);
}

.lobby-tutorial__btn--primary:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

.lobby-tutorial__btn--secondary {
  background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(127, 140, 141, 0.3);
}

.lobby-tutorial__btn--secondary:hover {
  background: linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(127, 140, 141, 0.4);
}

.lobby-tutorial__dialog lobby-tutorial__dialog--intro-1 {
  width: 95% !important;
}

/* Personalización fácil para cada paso del tutorial */
/* Solo necesitas definir las variables CSS que quieres cambiar */

.lobby-tutorial__dialog--intro-1 {
  --dialog-width: 95%;
}

.lobby-tutorial__dialog--intro-2 {
  --dialog-width: 95%;
}

.lobby-tutorial__dialog--intro-3 {
  --dialog-width: 95%;
}

.lobby-tutorial__dialog--scenes-container {
  --dialog-width: 350px;
  --dialog-top: 10px;
}

.lobby-tutorial__dialog--scenes-container {
  --dialog-width: 500px;
  --dialog-top: 14px;
}

.lobby-tutorial__highlight--scenes-container {
  --highlight-border-color: gold;
  --highlight-offset-y: -4px;
  --highlight-offset-x: -4px;
}

.lobby-tutorial__dialog--scene-item {
  --dialog-width: 500px;
  --dialog-top: 25px;
}

.lobby-tutorial__highlight--scene-item {
  --highlight-border-color: gold;
  --highlight-offset-y: -4px;
  --highlight-offset-x: -4px;
}

.lobby-tutorial__dialog--user-count {
  --dialog-width: 500px;
  --dialog-top: 26px;
}

.lobby-tutorial__highlight--user-count {
  --highlight-border-color: gold;
  --highlight-offset-y: -3px;
  --highlight-offset-x: -3px;
}

.lobby-tutorial__dialog--credits-component {
  --dialog-width: 700px;
  --dialog-top: 388px;
  --dialog-left: 200px;
}

.lobby-tutorial__dialog--game-layer {
  --dialog-width: 530px;
  --dialog-top: 400px;
  --dialog-left: 355px;
}

.lobby-tutorial__highlight--game-layer {
  --highlight-border-color: gold;
  --highlight-offset-y: -4px;
  --highlight-offset-x: -4px;
  --highlight-width: 156px;
  --highlight-height: 253px;
  --highlight-left: 193px;
  --highlight-top: 410px;
}

.lobby-tutorial__dialog--lobby-mail {
  --dialog-width: 540px;
  --dialog-top: 424px;
  --dialog-left: 78px;
}

.lobby-tutorial__highlight--lobby-mail {
  --highlight-border-color: gold;
  --highlight-offset-y: -4px;
  --highlight-offset-x: -4px;
  --highlight-width: 110px;
  --highlight-height: 100px;
  --highlight-left: 638px;
  --highlight-top: 562px;
}

.lobby-tutorial__dialog--lobby-settings {
  --dialog-width: 540px;
  --dialog-top: 424px;
  --dialog-left: 193px;
}

.lobby-tutorial__highlight--lobby-settings {
  --highlight-border-color: gold;
  --highlight-offset-y: -4px;
  --highlight-offset-x: -4px;
  --highlight-width: 110px;
  --highlight-height: 100px;
  --highlight-left: 752px;
  --highlight-top: 562px;
}

.lobby-tutorial__dialog--lobby-logout {
  --dialog-width: 540px;
  --dialog-top: 451px;
  --dialog-left: 308px;
}

.lobby-tutorial__highlight--lobby-logout {
  --highlight-border-color: gold;
  --highlight-offset-y: -4px;
  --highlight-offset-x: -4px;
  --highlight-width: 136px;
  --highlight-height: 127px;
  --highlight-left: 867px;
  --highlight-top: 537px;
}

/* Ejemplos para otros pasos: */
/*
.lobby-tutorial__dialog--intro-1 {
  --dialog-width: 400px;
  --dialog-bottom: 20px;
}

.lobby-tutorial__dialog--lobby-mail {
  --dialog-width: 280px;
  --dialog-left: 50px;
  --dialog-top: 100px;
}

.lobby-tutorial__highlight--lobby-mail {
  --highlight-width: 150px;
  --highlight-height: 80px;
  --highlight-left: 100px;
  --highlight-top: 200px;
  --highlight-border-width: 5px;
  --highlight-border-color: #3498db;
  --highlight-border-radius: 15px;
  --highlight-offset-x: 10px;
}

.lobby-tutorial__dialog--credits-component {
  --dialog-width: 300px;
  --dialog-height: 250px;
  --dialog-transform: scale(1.1);
}
*/

/* Animaciones */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(241, 196, 15, 0.6);
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
    box-shadow: 0 0 30px rgba(241, 196, 15, 0.8);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(241, 196, 15, 0.6);
  }
}

/* SISTEMA DE PERSONALIZACIÓN FÁCIL PARA TUTORIAL */
/* 
  Cada paso del tutorial puede ser personalizado usando variables CSS:
  
  PARA DIÁLOGOS (.lobby-tutorial__dialog--{step-id}):
  --dialog-width: tamaño horizontal (ej: 400px)
  --dialog-height: tamaño vertical (ej: 300px, auto)
  --dialog-left: posición horizontal (ej: 50px, 50%, auto)
  --dialog-top: posición desde arriba (ej: 100px, auto)
  --dialog-bottom: posición desde abajo (ej: 20px, auto)
  --dialog-transform: transformaciones (ej: scale(1.1), translateX(-50%))
  
  PARA HIGHLIGHTS (.lobby-tutorial__highlight--{step-id}):
  --highlight-width: ancho del highlight (ej: 200px, auto)
  --highlight-height: alto del highlight (ej: 100px, auto)
  --highlight-left: posición horizontal absoluta (ej: 50px, auto)
  --highlight-top: posición vertical absoluta (ej: 100px, auto)
  --highlight-border-width: grosor del borde (ej: 5px)
  --highlight-border-color: color del borde (ej: #e74c3c, #3498db)
  --highlight-border-radius: redondez del borde (ej: 15px)
  --highlight-shadow-color: color de la sombra (ej: rgba(231, 76, 60, 0.6))
  --highlight-offset-x: desplazamiento horizontal (ej: 10px, -5px)
  --highlight-offset-y: desplazamiento vertical (ej: -5px, 10px)
  --highlight-transform: transformaciones (ej: scale(1.05))
  
  Los pasos disponibles son:
  intro-1, intro-2, intro-3, scenes-container, scene-item, user-count,
  credits-component, game-layer, lobby-mail, lobby-settings, lobby-logout
*/

/* Responsive */
@media (max-width: 768px) {
  .lobby-tutorial__dialog {
    width: 280px;
    margin: 10px;
  }

  .lobby-tutorial__dialog-body p {
    font-size: 13px;
  }
}
</style>
