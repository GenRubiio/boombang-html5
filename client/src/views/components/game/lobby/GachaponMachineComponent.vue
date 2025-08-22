<template>
  <div>
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

        <!-- Capa UI -->
        <div class="ui-layer">
          <div class="title-container">
            <div ref="titleUI" class="title">
              <h2 class="wiggle">Tap to get a prize!</h2>
            </div>
          </div>
          <div class="prize-container">
            <div ref="prizeBallContainer" class="prize-ball-container"></div>
            <div class="prize-reward-container">
              <div class="shine">
                <img :src="shineSrc" alt="shine" />
              </div>
              <div class="prize">
                <img class="wiggle" :src="currentPrize.image" alt="prize" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- confetti container se inyecta dinámicamente -->
    </div>
    <div id="confetti-container"></div>
  </div>
</template>

<script>
/**
 * GachaMachine.vue (Option API)
 * - Convierte tu HTML/CSS/JS a un componente Vue.
 * - Usa GSAP 3 para animaciones (incluye RoughEase).
 */
import { gsap } from "gsap";
import { RoughEase } from "gsap/EasePack";

gsap.registerPlugin(RoughEase);

export default {
  name: "GachaMachine",

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
      default: "https://assets.codepen.io/2509128/gotcha.svg",
    },
    handleSrc: {
      type: String,
      default: "https://assets.codepen.io/2509128/handle.svg",
    },
    shineSrc: {
      type: String,
      default: "https://assets.codepen.io/2509128/shine.png",
    },
  },

  data() {
    return {
      // estado
      balls: [],
      jitters: [],
      started: false,
      prizeBall: null,
      currentPrize: { image: "", title: "" },
      prizesPool: [
        {
          image: "https://assets.codepen.io/2509128/prize1.png",
          title: "Bunny",
        },
        {
          image: "https://assets.codepen.io/2509128/prize2.png",
          title: "Teddy Bear",
        },
        {
          image: "https://assets.codepen.io/2509128/prize3.png",
          title: "Polar Bear",
        },
        {
          image: "https://assets.codepen.io/2509128/prize4.png",
          title: "Polar Bear Bride",
        },
      ],
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
    if (this.prizeBall?.dom)
      this.prizeBall.dom.replaceWith(this.prizeBall.dom.cloneNode(true));
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
      // set prize al inicio
      this.currentPrize =
        this.prizesPool[Math.floor(Math.random() * this.prizesPool.length)];

      const app = this.$refs.app;
      app.classList.add("gotcha");

      // pinto título de la máquina y precio
      const machineEl = this.$refs.machine;
      machineEl.querySelector(".title").innerHTML = [...this.titleText]
        .map((ch) => `<span>${ch}</span>`)
        .join("");
      machineEl.querySelector(".price").innerText = this.priceText;

      // estados iniciales gsap (de vmin a px)
      gsap.set(this.$refs.titleUI, { y: this.vmin(120) }); // 120vmin -> 645px
      gsap.set(".prize-reward-container", { opacity: 0 });

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

    async start() {
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
        this.pickup();
      };
      this.prizeBall.dom.addEventListener("click", onPick, { once: true });
    },

    pickup() {
      const rect = this.prizeBall.dom.getBoundingClientRect();
      // Antes se convertía a vmin. Ahora mantenemos la lógica y pasamos a px:
      const xPx = (rect.x / window.innerHeight) * 100 * 5.375;
      const yPx = (rect.y / window.innerHeight) * 100 * 5.375;

      this.$refs.prizeBallContainer.appendChild(this.prizeBall.dom);
      const rotate = this.prizeBall.rotate;
      this.prizeBall.x = 0;
      this.prizeBall.y = 0;
      this.prizeBall.rotate = 0;

      this.addAnimClass(".game-layer", "dim");

      this.prizeBall.dom.style.left = 0;
      this.prizeBall.dom.style.top = 0;

      gsap.set(this.prizeBall.dom, {
        x: xPx,
        y: yPx,
        rotate,
        duration: 1,
      });
      gsap.to(this.$refs.prizeBallContainer, {
        x: -this.vmin(4), // -21.5px
        y: -this.vmin(4),
        duration: 1,
      });

      const tl = gsap.timeline();
      this.timelines.push(tl);

      tl.to(this.prizeBall.dom, {
        x: this.vw(50), // "50vw" → px
        y: this.vmin(50), // "50vmin" → 268.75px
        scale: 2,
        rotate: -180,
        duration: 1,
      })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          scaleX: 2.1,
          ease: "power1.inOut",
          scaleY: 1.9,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 1.9,
          scaleY: 2.1,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 2.1,
          scaleY: 1.9,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 1.9,
          scaleY: 2.1,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 2.1,
          scaleY: 1.9,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 1.9,
          scaleY: 2.1,
        })
        .to(this.prizeBall.dom, {
          duration: 0.5,
          ease: "power1.out",
          scaleX: 2.6,
          scaleY: 1.6,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.out",
          scaleX: 1.6,
          scaleY: 2.4,
          onComplete: this.pop,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.out",
          scaleX: 2.1,
          scaleY: 1.9,
        })
        .to(this.prizeBall.dom, {
          duration: 0.1,
          ease: "power1.out",
          scaleX: 2,
          scaleY: 2,
        });
    },

    pop() {
      this.makeConfetti(this.$refs.app, {
        speedY: -0.5,
        speedRandY: 1,
        speedRandX: 0.75,
        gravity: 0.02,
        y: 50,
        randX: 6,
        randY: 6,
        size: 8,
        sizeRand: 4,
        count: 128,
      });

      gsap.set(".prize-reward-container .prize", { scale: 0 });
      gsap.to(".prize-reward-container", { opacity: 1, duration: 0.3 });
      gsap.to(".prize-reward-container .prize", {
        scale: 1,
        duration: 0.5,
        ease: "back.out",
      });
      gsap.to(this.prizeBall.dom, { opacity: 0 });

      gsap.set(this.$refs.titleUI, { y: -this.vmin(50) }); // -268.75px
      this.$refs.titleUI.children[0].innerHTML = `You got a<br>${this.currentPrize.title}`;
      gsap.to(this.$refs.titleUI, { delay: 1, y: this.vmin(5), duration: 0.6 }); // 26.875px

      const prizeContainer = document.querySelector(".prize-container");
      prizeContainer.style.pointerEvents = "all";
      prizeContainer.addEventListener("click", this.reset, { once: true });
    },

    reset() {
      // Limpiar para re-jugar
      const prizeContainer = document.querySelector(".prize-container");
      prizeContainer.style.pointerEvents = "none";

      // Ocultar premio y título
      gsap.to(".prize-reward-container", { opacity: 0, duration: 0.3 });
      gsap.to(this.$refs.titleUI, { y: this.vmin(120), duration: 0.6 }); // 645px

      // Resetear estado del juego
      this.started = false;

      // Limpiar y recrear bolas
      this.$refs.balls.innerHTML = "";
      this.balls = [];
      this.createBalls();

      // Quitar clase 'dim'
      this.removeAnimClass(".game-layer", "dim");

      // Preparar para la siguiente ronda
      this.prepare();

      // Asignar nuevo premio
      this.currentPrize =
        this.prizesPool[Math.floor(Math.random() * this.prizesPool.length)];
    },

    enableHandle() {
      const handle = this.$refs.handle;
      if (!handle) return;

      const onceStart = () => {
        handle.style.cursor = "default";
        this.start();
        handle.removeEventListener("click", onceStart);
      };

      handle.style.cursor = "pointer";
      handle.addEventListener("click", onceStart, { once: true });
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

    makeConfetti($parent, cfg = {}) {
      const {
        count = 100,
        x = 50,
        y = 50,
        randX = 10,
        randY = 10,
        speedX = 0,
        speedY = -2,
        speedRandX = 0.5,
        speedRandY = 0.5,
        gravity = 0.01,
        size = 10,
        sizeRand = 5,
      } = cfg;

      const container = document.createElement("div");
      container.classList.add("confetti");
      $parent.insertAdjacentElement("beforeend", container);

      const particles = [];
      for (let i = 0; i < count; i++) {
        const span = document.createElement("span");
        const settings = {
          dom: span,
          x: x + Math.random() * randX * 2 - randX,
          y: y + Math.random() * randY * 2 - randY,
          speedX: speedX + Math.random() * speedRandX * 2 - speedRandX,
          speedY: speedY + Math.random() * speedRandY * 2 - speedRandY,
          size: size + Math.random() * sizeRand * 2 - sizeRand,
        };
        span.style.backgroundColor = `hsl(${Math.random() * 360}deg, 80%, 60%)`;
        span.style.setProperty("--rx", Math.random() * 2 - 1);
        span.style.setProperty("--ry", Math.random() * 2 - 1);
        span.style.setProperty("--rz", Math.random() * 2 - 1);
        span.style.setProperty("--rs", Math.random() * 2 + 0.5);
        particles.push(settings);
        container.appendChild(span);
      }

      const update = () => {
        particles.forEach((p, i) => {
          if (p.y > 100) {
            particles.splice(i, 1);
            p.dom.remove();
            return;
          }
          p.dom.style.setProperty("--size", p.size);
          p.dom.style.left = p.x + "%";
          p.dom.style.top = p.y + "%";
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedY += gravity;
        });

        if (particles.length) {
          this.rafId = requestAnimationFrame(update);
        } else {
          container.remove();
        }
      };

      update();
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&display=swap");

/* ====== SCSS util stroke ====== */
%stroke {
  text-shadow: 0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white),
    0px 0px 2px var(--stroke-color, white);
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.2));
}

/* ====== Reset mínimo ====== */
*,
*::before,
*::after {
  box-sizing: border-box;
  font-family: inherit;
  padding: 0;
  margin: 0;
}

html {
  font-size: 62.5%;
  height: 100%;
  color: white;
  font-family: "M PLUS Rounded 1c", "Trebuchet MS", Arial, sans-serif;

  body {
    font-size: 1.6rem;
    overflow: hidden;
    height: 100%;
    position: relative;
    user-select: none;
  }
}

.dim[data-animate] {
  filter: brightness(0.6) saturate(0.8);
  transition: 0.5s linear;
}

/* ====== Confetti ====== */
#confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  perspective: 100vmin;

  span {
    --size: 5;
    display: block;
    position: absolute;
    width: calc(var(--size) * 1px);
    height: calc(var(--size) * 1px);
    background-color: blue;
    animation: rotate linear calc(var(--rs) * 1s) infinite both;
  }
}

#gotcha.gotcha {
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
          @extend %stroke;
          font-size: 26.875px; // 5vmin
          z-index: 3;

          span {
            animation: blink 0.8s linear both infinite;

            &:nth-child(1) {
              animation-delay: 0.12s;
            }
            &:nth-child(2) {
              animation-delay: 0.24s;
            }
            &:nth-child(3) {
              animation-delay: 0.36s;
            }
            &:nth-child(4) {
              animation-delay: 0.48s;
            }
            &:nth-child(5) {
              animation-delay: 0.6s;
            }
            &:nth-child(6) {
              animation-delay: 0.72s;
            }
            &:nth-child(7) {
              animation-delay: 0.84s;
            }
            &:nth-child(8) {
              animation-delay: 0.96s;
            }
            &:nth-child(9) {
              animation-delay: 1.08s;
            }
            &:nth-child(10) {
              animation-delay: 1.2s;
            }
          }
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

    .ui-layer {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      pointer-events: none;

      .title-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;

        .title {
          h2 {
            --stroke-color: #f06e5b;
            text-align: center;
            @extend %stroke;
            font-size: 26.875px; // 5vmin
          }
        }
      }

      .prize-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;

        .prize-ball-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
        }

        .prize-reward-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;

          & > * {
            display: block;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .prize {
            img {
              height: 268.75px; // 50vmin
            }
          }

          .shine {
            img {
              height: 537.5px; // 100vmin
              animation: spin linear 5s infinite forwards;
            }
          }
        }
      }
    }

    .ball {
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
  }

  .wiggle {
    animation: wiggle 2s ease-in-out infinite both;
  }
}

/* ====== keyframes ====== */
@keyframes blink {
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

@keyframes wiggle {
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

@keyframes click {
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

@keyframes spin {
  from {
    transform: rotate(1turn);
  }
  to {
    transform: rotate(0turn);
  }
}

@keyframes rotate {
  from {
    transform: rotate3d(var(--rx), var(--ry), var(--rz), 0turn);
  }
  to {
    transform: rotate3d(var(--rx), var(--ry), var(--rz), 1turn);
  }
}
</style>
