<template>
  <div>
    <div class="select-avatar">
      <div class="select-avatar__container">
        <div class="select-avatar__title">{{ $t("avatar_select.title") }}</div>
        <div class="select-avatar__label">{{ $t("avatar_select.label") }}</div>
        <div class="select-avatar__slider">
          <div class="slider">
            <div id="slide-0" :data-avatar="AvatarEnum.GATA">
              <img :src="asset_gata_redbull_image" />
            </div>
            <div id="slide-1" :data-avatar="AvatarEnum.RASTA">
              <img :src="asset_rasta_redbull_image" />
            </div>
          </div>
        </div>
        <div class="select-avatar__input-container">
          <div class="select-avatar__title">{{ $t("register.language") }}</div>
          <div class="select-avatar__input">
            <select v-model="lang" @change="onLangChange">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ru">Русский</option>
              <option value="zh">简体中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import asset_gata_redbull_image from "@/assets/game/auth/gata-redbull.webp";
import asset_rasta_redbull_image from "@/assets/game/auth/rasta-redbull.webp";
import AvatarEnum from "@/enums/AvatarEnum";

import $ from "jquery";
import "slick-carousel";

export default {
  data() {
    return {
      asset_gata_redbull_image,
      asset_rasta_redbull_image,
      AvatarEnum,
      lang: "en",
    };
  },
  methods: {
    onLangChange() {
      this.$emit("changeLang", this.lang);
    },
    getBrowserLanguage() {
      const browserLang = navigator.language.split("-")[0];
      const supportedLangs = ["en", "es", "ru", "zh", "ja", "ko"];
      if (supportedLangs.includes(browserLang)) {
        return browserLang;
      }
      return "en"; // Default language
    },
  },
  mounted() {
    this.lang = this.getBrowserLanguage();
    this.onLangChange(); // Emit initial language

    $(".slider").slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
    });
    $(".slider").on("afterChange", (event, slick, currentSlide) => {
      let slideElement = slick.$slides.get(currentSlide);
      let avatar = $(slideElement).find("[data-avatar]").data("avatar");
      this.$emit("changeAvatar", avatar);
    });
  },
};
</script>
<style>
@import "slick-carousel/slick/slick.css";
@import "slick-carousel/slick/slick-theme.css";

.select-avatar__slider {
  width: 100%;
  height: 120px;
  margin-top: 10px;
  position: relative;
}

.select-avatar__slider .slick-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.select-avatar__slider .slick-prev {
  left: 0;
}

.select-avatar__slider .slick-next {
  right: 0;
}

.slick-slide {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding-top: 5px !important;
}
.slider img {
  max-height: 120px; /* limita la altura */
  width: auto; /* mantiene la proporción */
  display: block; /* quita el espacio extra de imágenes inline */
  object-fit: cover; /* (opcional) recorta la imagen si no cabe */
}
</style>
<style scoped>
.select-avatar {
  position: relative;
  width: 200px;
  padding: 10px;
  background-color: #003d6c;
  border-radius: 10px;
  margin-top: 65px;
}

.select-avatar__container {
  background-color: #0072c6;
  border-radius: 10px;
  text-align: start;
  padding: 10px;
}

.select-avatar__title {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 3px;
}

@keyframes levitation {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(2deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

.select-avatar img {
  animation: levitation 3s ease-in-out infinite;
}

.select-avatar__label {
  font-size: 16px;
  font-weight: bold;
  color: #003d6c;
  line-height: 16px;
}

.select-avatar__input-container {
  position: relative;
}

.select-avatar__input select {
  width: 100%;
  box-sizing: border-box;
  font-size: 22px;
  border-radius: 5px;
  background-color: #0d97f1;
  border: none;
  color: white;
  font-weight: bold;
  padding: 0 5px;
  cursor: pointer;
}

.select-avatar__input select option {
  font-size: 18px;
}

.select-avatar__input select:hover,
.select-avatar__input select:focus,
.select-avatar__input select:active {
  outline: none;
}
</style>
