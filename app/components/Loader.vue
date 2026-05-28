<template>
  <div class="c-loader">
    <div class="c-loader__spinner">
      <div class="c-loader__spinner-dot"></div>
      <div class="c-loader__spinner-dot"></div>
      <div class="c-loader__spinner-dot"></div>
      <div class="c-loader__spinner-dot"></div>
      <div class="c-loader__spinner-dot"></div>
      <div class="c-loader__spinner-dot"></div>
    </div>
    <div class="c-loader__text" v-if="title || subtitle">
      <h4 v-if="title" class="c-loader__title">{{ title }}</h4>
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup>
const { title, subtitle } = defineProps({
  title: { type: String },
  subtitle: { type: String },
});
</script>

<style lang="scss" scoped>
.c-loader {
  padding: rem($spacer-unit * 4) rem($spacer-unit * 2);
  color: $secondary-dark;
  text-align: center;

  &__text {
    margin-top: rem($spacer-unit * 2);
  }

  &__title {
    @include th4;

    & {
      text-transform: uppercase;
      margin: 0 0 rem($spacer-unit) 0;
    }

    @media (min-width: $md) {
      @include th4;

      margin: 0 0 rem($spacer-unit) 0;
    }
  }

  &__spinner {
    margin: 0 auto;
    width: rem($spacer-unit * 5);
    height: rem($spacer-unit * 5);
    position: relative;
    animation: sk-chase 2.5s infinite linear both;
  }

  &__spinner-dot {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    animation: sk-chase-dot 2s infinite ease-in-out both;

    &::before {
      content: "";
      display: block;
      width: 25%;
      height: 25%;
      background-color: $secondary;
      border-radius: 100%;
      animation: sk-chase-dot-before 2s infinite ease-in-out both;
    }

    &:nth-child(1) {
      animation-delay: -1.1s;

      &::before {
        animation-delay: -1.1s;
      }
    }

    &:nth-child(2) {
      animation-delay: -1s;

      &::before {
        animation-delay: -1s;
      }
    }

    &:nth-child(3) {
      animation-delay: -0.9s;

      &::before {
        animation-delay: -0.9s;
      }
    }

    &:nth-child(4) {
      animation-delay: -0.8s;

      &::before {
        animation-delay: -0.8s;
      }
    }

    &:nth-child(5) {
      animation-delay: -0.7s;

      &::before {
        animation-delay: -0.7s;
      }
    }

    &:nth-child(6) {
      animation-delay: -0.6s;

      &::before {
        animation-delay: -0.6s;
      }
    }
  }
}

@keyframes sk-chase {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sk-chase-dot {
  80%,
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sk-chase-dot-before {
  50% {
    transform: scale(0.4);
  }

  100%,
  0% {
    transform: scale(1);
  }
}
</style>
