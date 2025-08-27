<template>
  <div class="gachapon-root">
    <div ref="app" id="gotcha" class="gotcha">
      <div class="container">
        <!-- Capa del juego -->
        <div class="game-layer">
          <div ref="machine" class="machine-container">
            <div class="backboard"></div>
            <div ref="balls" class="balls"></div>

            <img class="machine" :src="machineSrc" alt="machine" />
            <div class="title"></div>
            <div class="price"></div>

            <img ref="handle" class="handle" :src="handleSrc" alt="handle" />
          </div>
        </div>
      </div>

      <!-- confetti container se inyecta dinámicamente -->
    </div>
  </div>
</template>

<script>
import { gsap } from "gsap";
import { RoughEase } from "gsap/EasePack";

gsap.registerPlugin(RoughEase);

export default {
  name: "GachaMachine",
  emits: ["request-purchase", "show-prize"],

  props: {
    titleText: {
      type: String,
      default: "がんばれ!",
    },
    priceText: {
      type: String,
      default: "100円",
    },
    speed: {
      type: Number,
      default: 1,
    },
    machineSrc: {
      type: String,
      default: "assets/game/lobby/gacha/gotcha.svg",
    },
    handleSrc: {
      type: String,
      default: "assets/game/lobby/gacha/handle.svg",
    },
  },

  data() {
    return {
      // estado
      balls: [],
      jitters: [],
      started: false,
      prizeBall: null,
      // refs de gsap timelines/raf
      timelines: [],
      rafId: null,
    };
  },

  mounted() {
    this.bootstrap();
  },

  beforeUnmount() {
    // Limpieza completa
    try {
      this.jitters.forEach((tl) => tl && tl.pause && tl.pause());
      this.timelines.forEach((tl) => tl && tl.kill && tl.kill());
    } catch (_) {}
    this.jitters = [];
    this.timelines = [];

    if (this.rafId) cancelAnimationFrame(this.rafId);
    // quitar listeners si alguno quedó
    if (this.$refs.handle)
      this.$refs.handle.replaceWith(this.$refs.handle.cloneNode(true));
    if (this.prizeBall?.dom) {
      const newElement = this.prizeBall.dom.cloneNode(true);
      this.prizeBall.dom.parentNode.replaceChild(
        newElement,
        this.prizeBall.dom
      );
    }
  },

  methods: {
    // Utils para convertir
    vmin(n) {
      return n * 5.375; // 1vmin = 5.375px (80vmin = 430px)
    },
    vw(n) {
      return (window.innerWidth * n) / 100; // n vw a px
    },

    delay(ms) {
      return new Promise((r) => setTimeout(r, ms));
    },

    async bootstrap() {
      const app = this.$refs.app;
      app.classList.add("gotcha");

      // pinto título de la máquina y precio
      const machineEl = this.$refs.machine;
      machineEl.querySelector(".title").innerHTML = [...this.titleText]
        .map((ch) => `<span>${ch}</span>`)
        .join("");
      machineEl.querySelector(".price").innerText = this.priceText;

      // crear bolas
      this.createBalls();

      setTimeout(this.prepare, 500 * this.speed);
    },

    prepare() {
      this.enableHandle();

      // jitter fijo inicial visual
      this.balls.forEach((ball) => {
        const tlb = gsap
          .timeline()
          .to(ball.dom, {
            y: -(10 + Math.random() * 10),
            ease: "power1.out",
            duration: 0.05 + Math.random() * 0.1,
          })
          .to(ball.dom, {
            y: 0,
            ease: "power1.in",
            duration: 0.05 + Math.random() * 0.1,
          });

        this.timelines.push(tlb);
      });
    },

    showPrize() {
      this.$emit("show-prize");
      this.resetMachine();
    },

    async triggerAnimation() {
      this.started = true;

      // girar manija y vibrar
      await new Promise((resolve) => {
        const tl = gsap.timeline();
        this.timelines.push(tl);

        tl.to(this.$refs.handle, {
          rotate: 90,
          duration: 0.3,
          ease: "power1.in",
          onComplete: async () => {
            this.jitter();
            await this.delay(2000 * this.speed);
            await this.stopJittering();
            resolve();
          },
        }).to(this.$refs.handle, { rotate: 0, duration: 1 });
      });

      // caída de la bola premio
      await new Promise((resolve) => {
        const tl = gsap.timeline();
        this.timelines.push(tl);

        gsap.to(this.prizeBall.dom, {
          x: -this.vmin(3), // "-3vmin"
          ease: "none",
          duration: 0.5,
          rotate: this.prizeBall.rotate + 10,
        });

        // leves empujes a bolas laterales
        const tryShift = (i, dxVmin, dyVmin, dr) => {
          if (this.balls[i]) {
            gsap.to(this.balls[i].dom, {
              x: this.vmin(dxVmin),
              y: this.vmin(dyVmin),
              ease: "none",
              duration: 0.5,
              rotate: this.balls[i].rotate + dr,
            });
          }
        };
        tryShift(3, 1, 1, -5); // 1vmin → 5.375px
        tryShift(4, -1, 1, -5);
        tryShift(5, 1, 1, -5);

        tl.to(this.prizeBall.dom, {
          y: this.vmin(12), // 64.5px
          ease: "power1.in",
          duration: 0.5,
        })
          .to(this.prizeBall.dom, {
            y: this.vmin(23), // 123.625px
            ease: "power1.in",
            duration: 0.5,
          })
          .to(this.prizeBall.dom, {
            y: this.vmin(22), // 118.25px
            ease: "power1.out",
            duration: 0.2,
          })
          .to(this.prizeBall.dom, {
            y: this.vmin(23),
            ease: "power1.in",
            duration: 0.2,
          })
          .to(this.prizeBall.dom, {
            y: this.vmin(22.5), // 120.9375px
            ease: "power1.out",
            duration: 0.1,
          })
          .to(this.prizeBall.dom, {
            y: this.vmin(23),
            ease: "power1.in",
            duration: 0.1,
            onComplete: resolve,
          });
      });

      this.prizeBall.dom.style.cursor = "pointer";

      const onPick = () => {
        this.prizeBall.dom.style.cursor = "default";
        this.showPrize();
      };
      this.prizeBall.dom.addEventListener("click", onPick, { once: true });
    },

    resetMachine() {
      // Detener todas las animaciones
      try {
        this.jitters.forEach((tl) => tl && tl.pause && tl.pause());
        this.timelines.forEach((tl) => tl && tl.kill && tl.kill());
      } catch (_) {}
      this.jitters = [];
      this.timelines = [];

      // Resetear estado del juego
      this.started = false;

      // Limpiar y recrear bolas
      this.$refs.balls.innerHTML = "";
      this.balls = [];
      this.createBalls();

      // Preparar para la siguiente ronda
      this.prepare();
    },

    enableHandle() {
      const handle = this.$refs.handle;
      if (!handle) return;

      const onRequest = () => {
        this.$emit("request-purchase");
      };

      handle.style.cursor = "pointer";
      handle.addEventListener("click", onRequest, { once: true });
    },

    createBalls() {
      const $balls = this.$refs.balls;
      let id = 0;

      const createBall = (
        x,
        y,
        rotate = ~~(Math.random() * 360),
        hue = ~~(Math.random() * 360)
      ) => {
        const sizeVmin = 8;
        const sizePx = this.vmin(sizeVmin); // 43px

        const el = document.createElement("figure");
        el.classList.add("ball");
        el.setAttribute("data-id", ++id);
        el.style.setProperty("--size", `${sizePx}px`);
        el.style.setProperty("--color1", `hsl(${hue}deg, 80%, 70%)`);
        el.style.setProperty("--color2", `hsl(${hue + 20}deg, 50%, 90%)`);
        el.style.setProperty("--outline", `hsl(${hue}deg, 50%, 55%)`);
        $balls.appendChild(el);

        const update = () => {
          gsap.set(el, {
            css: {
              left: `calc(${x} * (100% - ${sizePx}px))`,
              top: `calc(${y} * (100% - ${sizePx}px))`,
              transform: `rotate(${rotate}deg)`,
            },
          });
        };

        const ball = {
          dom: el,
          get x() {
            return x;
          },
          get y() {
            return y;
          },
          get rotate() {
            return rotate;
          },
          set x(v) {
            x = v;
            update();
          },
          set y(v) {
            y = v;
            update();
          },
          set rotate(v) {
            rotate = v;
            update();
          },
          get size() {
            return sizePx;
          },
        };

        this.balls.push(ball);
        update();
        return ball;
      };

      // mismos puntos que tu script
      createBall(0.5, 0.6);
      createBall(0, 0.68);
      createBall(0.22, 0.65);
      createBall(0.7, 0.63);
      createBall(0.96, 0.66);
      createBall(0.75, 0.79);
      createBall(0.5, 0.8);
      this.prizeBall = createBall(0.9, 0.81);
      createBall(0, 0.82);
      createBall(1, 0.9);
      createBall(0.25, 0.85);
      createBall(0.9, 1);
      createBall(0.4, 1);
      createBall(0.65, 1);
      createBall(0.09, 1);
    },

    jitter() {
      this.balls.forEach(({ dom, rotate }, i) => {
        const tl = gsap.timeline({ repeat: -1, delay: -i * 0.0613 });
        this.jitters.push(tl);

        gsap.set(dom, { y: 0, rotateZ: rotate });

        const duration = Math.random() * 0.1 + 0.05;

        tl.to(dom, {
          y: -(Math.random() * 6 + 2),
          rotateZ: rotate,
          duration,
          ease: "rough({ template: none, strength: 1, points: 20, taper: none, randomize: true, clamp: false })",
        }).to(dom, {
          y: 0,
          rotateZ: rotate - Math.random() * 10 - 5,
          duration,
        });
      });

      const tl = gsap.timeline({ repeat: -1 });
      tl.to(".machine-container", { x: 2, duration: 0.1 }).to(
        ".machine-container",
        { x: 0, duration: 0.1 }
      );
      this.jitters.push(tl);
    },

    async stopJittering() {
      this.jitters.forEach((tl) => tl.pause());
      this.jitters = [];

      this.balls.forEach(({ dom, rotate }) => {
        gsap.to(dom, { y: 0, rotate, duration: 0.1 });
      });
      gsap.to(".machine-container", { x: 0, duration: 0.1 });
      await this.delay(200);
    },

    addAnimClass(elOrSelector, clazz) {
      const apply = (el) => {
        el.classList.add(clazz);
        el.setAttribute("data-animate", "");
      };
      if (typeof elOrSelector === "string") {
        [...document.querySelectorAll(elOrSelector)].forEach(apply);
      } else {
        apply(elOrSelector);
      }
    },

    removeAnimClass(elOrSelector, clazz) {
      const apply = (el) => {
        el.classList.remove(clazz);
        el.removeAttribute("data-animate");
      };
      if (typeof elOrSelector === "string") {
        [...document.querySelectorAll(elOrSelector)].forEach(apply);
      } else {
        apply(elOrSelector);
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* ====== Reset y base SOLO dentro del componente ====== */
.gachapon-root,
.gachapon-root *,
.gachapon-root *::before,
.gachapon-root *::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  font-family: inherit;
}

.gachapon-root {
  font-size: 10px; /* root local: 1em ≈ 10px */
  color: white;
  font-family: "M PLUS Rounded 1c", "Trebuchet MS", Arial, sans-serif;
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  overflow: hidden;
}

.gachapon-root .dim[data-animate] {
  filter: brightness(0.6) saturate(0.8);
  transition: 0.5s linear;
}

/* ====== keyframes únicos ====== */
@keyframes gacha-blink {
  0% {
    color: #ffc7e5;
  }
  20% {
    color: #fcff33;
  }
  100% {
    color: #ffc7e5;
  }
}

@keyframes gacha-wiggle {
  0% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(-5deg);
  }
}

@keyframes gacha-click {
  0% {
    transform: rotate(-30deg) translateY(0vmin);
  }
  80% {
    transform: rotate(-30deg) translateY(5vmin);
  }
  100% {
    transform: rotate(-30deg) translateY(0vmin);
  }
}

@keyframes gacha-spin {
  from {
    transform: rotate(1turn);
  }
  to {
    transform: rotate(0turn);
  }
}

/* ====== util stroke ====== */
%gacha-stroke {
  text-shadow: 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white), 0 0 2px var(--stroke-color, white),
    0 0 2px var(--stroke-color, white);
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.2));
}

/* ====== estructura del componente ====== */
.gachapon-root #gotcha.gotcha {
  --gachapon-scale: 0.65;
  width: 100%;
  height: 100%;
  position: relative;
  transform: scale(var(--gachapon-scale));
  transform-origin: top center;

  .container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    .game-layer {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      .machine-container {
        position: relative;
        white-space: nowrap;

        .machine {
          position: relative;
          z-index: 1;
          max-height: 430px; // 80vmin
          pointer-events: none;
        }

        .backboard {
          z-index: 0;
          width: 80.625px; // 15vmin
          height: 69.875px; // 13vmin
          top: 65%;
          left: 48%;
          background-color: #e288bb;
          position: absolute;
        }

        .title {
          --stroke-color: #ad8bd6;
          position: absolute;
          display: block;
          top: 10%;
          width: 100%;
          text-align: center;
          @extend %gacha-stroke;
          font-size: 26.875px; // 5vmin
          z-index: 3;
        }

        .price {
          z-index: 3;
          position: absolute;
          color: #fb91c9;
          font-size: 13.4375px; // 2.5vmin
          top: 80%;
          left: 15%;
        }

        .handle {
          z-index: 3;
          position: absolute;
          height: 20.9625px; // 3.9vmin
          left: 13%;
          top: 69%;
        }

        .balls {
          position: absolute;
          top: 22%;
          left: 2%;
          width: 96%;
          height: 34.5%;
        }
      }
    }
  }
}

/* ====== letras animadas en el título (spans generados) ====== */
.gachapon-root :deep(.title span) {
  animation: gacha-blink 0.8s linear both infinite;
}

.gachapon-root :deep(.title span:nth-child(1)) {
  animation-delay: 0.12s;
}
.gachapon-root :deep(.title span:nth-child(2)) {
  animation-delay: 0.24s;
}
.gachapon-root :deep(.title span:nth-child(3)) {
  animation-delay: 0.36s;
}
.gachapon-root :deep(.title span:nth-child(4)) {
  animation-delay: 0.48s;
}
.gachapon-root :deep(.title span:nth-child(5)) {
  animation-delay: 0.6s;
}
.gachapon-root :deep(.title span:nth-child(6)) {
  animation-delay: 0.72s;
}
.gachapon-root :deep(.title span:nth-child(7)) {
  animation-delay: 0.84s;
}
.gachapon-root :deep(.title span:nth-child(8)) {
  animation-delay: 0.96s;
}
.gachapon-root :deep(.title span:nth-child(9)) {
  animation-delay: 1.08s;
}
.gachapon-root :deep(.title span:nth-child(10)) {
  animation-delay: 1.2s;
}

/* ====== bolas creadas dinámicamente ====== */
.gachapon-root :deep(.ball) {
  --size: 43px; // 8vmin
  --outline: #4c3fc2;
  --color1: #2facff;
  --color2: #ff8ff6;

  width: var(--size);
  height: var(--size);
  border-radius: 100%;
  background-color: var(--color1);
  border: solid 4px var(--outline);
  position: absolute;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    height: 200%;
    width: 200%;
    background-color: var(--color2);
    border-radius: 100%;
    border: inherit;
    transform: translate(-25%, -5%);
  }
}

/* ====== clases añadidas por JS ====== */
.gachapon-root :deep(.wiggle) {
  animation: gacha-wiggle 2s ease-in-out infinite both;
}
</style>
