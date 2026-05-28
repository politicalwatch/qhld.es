<template>
  <div class="c-image-header">
    <figure>
      <img
        :srcset="imageSrcset"
        :sizes="imageSizes"
        :src="imageSrc"
        :alt="alt"
      />
    </figure>
    <h1 class="u-uppercase u-hide u-block@sm c-image-header__date">
      {{ home.Date }}
    </h1>
    <h2 class="u-uppercase u-hide u-block@sm c-image-header__date_title">
      {{ home.TitleDate }}
    </h2>
    <h2 class="u-uppercase u-hide@sm c-image-header__date">{{ home.Date }}</h2>
    <h3 class="u-uppercase u-hide@sm c-image-header__date_title">
      {{ home.TitleDate }}
    </h3>
    <h6 class="u-uppercase c-image-header__author u-hide u-block@sm">
      <a :href="home.ImageUrl" target="_blank"
        ><icon icon="mdi:camera" :height="16" /><span v-if="isUnsplashPhoto()"
          >Unsplash: </span
        >Photo by {{ home.ImageAuthor }}</a
      >
    </h6>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { home, alt, imageSrcset, imageSizes, imageSrc } = defineProps({
  home: Object,
  alt: String,
  imageSrcset: String,
  imageSizes: String,
  imageSrc: String,
});

const isUnsplashPhoto = () => {
  return home.ImageUrl.includes("unsplash.com") ? true : false;
};
</script>

<style lang="scss" scoped>
.c-image-header {
  width: 100%;
  position: relative;

  @media (min-width: $sm) {
    height: 480px;
  }

  &__date {
    color: $tipi-yellow;
    background-color: $black;
    display: inline-block;
    padding: 16px;
    margin: 0;
    position: absolute;
    bottom: 100px;
    left: 32px;

    @media (min-width: $sm) {
      bottom: 112px;
      font-size: rem(48px);
      line-height: rem(64px);
    }

    &_title {
      background-color: $tipi-yellow;
      display: inline-block;
      padding: 16px;
      margin: 0;
      position: absolute;
      left: 32px;
      bottom: 32px;

      @media (max-width: $xs) {
        bottom: 0;
      }
    }
  }

  &__author {
    position: absolute;
    bottom: 32px;
    right: 32px;
    background-color: white;
    padding: 8px;

    a {
      text-decoration: none;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      &:hover {
        text-decoration: underline;
      }

      .c-icon {
        margin-right: 8px;
      }
    }
  }

  figure {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    overflow: hidden;
    max-height: 480px;

    img {
      width: 100%;
    }
  }
}
</style>
