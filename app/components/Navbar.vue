<template>
  <header class="c-navbar">
    <div
      class="c-disclaimer"
      v-if="!closedDisclaimer && disclaimer.hasOwnProperty('name')"
    >
      <a
        v-if="disclaimer.external"
        :href="disclaimer.route"
        target="_blank"
        v-html="disclaimer.name"
      ></a>
      <router-link
        v-else
        :to="{ name: disclaimer.route }"
        v-html="disclaimer.name"
      ></router-link>

      <button
        class="c-disclaimer__close"
        id="disclaimer-close"
        aria-label="Close Disclaimer"
        @click="closeDisclaimer"
      >
        <Icon name="mdi:close-circle" style="color: #2d4252" />
      </button>
    </div>

    <div class="c-navbar__wrapper o-container">
      <div class="c-navbar__brand">
        <a class="c-navbar__brand-link" href="/">
          <Logo
            class="c-navbar__brand-logo"
            alt="Logo Qué hacen los diputados"
          />
        </a>
      </div>
      <button
        type="button"
        class="c-navbar__menu-toggle"
        id="menu-toggle"
        aria-label="Menu Toggle"
        :class="{ 'is-active': menuVisible }"
        v-on:click="toggleMenu"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="u-hide">Menú</span>
      </button>
      <nav class="c-navbar__menu" :class="{ 'is-active': menuVisible }">
        <ul class="c-menu">
          <li
            @click="closeMenuMobile"
            class="c-menu__item"
            v-for="link in links"
            :key="link.route"
            v-show="link.condition"
          >
            <a
              v-if="link.external"
              :href="link.route"
              class="c-menu__link"
              target="_blank"
            >
              {{ link.name }}
              <Icon
                :name="link.icon"
                :class="{
                  'c-menu__link': true,
                  'c-menu__link--icon': link.icon,
                }"
                v-if="link.icon"
                :size="20"
              />
            </a>
            <router-link
              v-else
              :to="{ name: link.route }"
              :class="{ 'c-menu__link': true, 'c-menu__link--icon': link.icon }"
            >
              <Icon
                :name="link.icon"
                class="c-menu__icon"
                v-if="link.icon"
                :size="20"
              />
              <span>{{ link.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>

import Logo from "@/assets/logo.svg";

const { links, disclaimer, preImage, logo } = defineProps({
  links: { type: Array },
  disclaimer: {
    type: Object,
    default: () => ({}),
  },
  preImage: { type: String },
  logo: { type: String },
});

const closedMessage = ref(false);
const menuVisible = ref(false);

const closedDisclaimer = computed(() => {
  if (import.meta.server) return false;
  return window.sessionStorage.getItem("closedDisclaimer") ||
    closedMessage.value
    ? true
    : false;
});

const closeDisclaimer = () => {
  window.sessionStorage.setItem("closedDisclaimer", true);
  closedMessage.value = true;
};

const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;
};

const closeMenuMobile = () => {
  if (menuVisible.value) {
    menuVisible.value = false;
  }
};
</script>

<style lang="scss" scoped>
.c-navbar {
  transition: height 1.3s ease;
  background-color: $navbar-background-color;

  &__wrapper {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: rem($spacer-unit * 2) rem($spacer-unit * 2);

    @media (min-width: $md) {
      padding: rem($spacer-unit * 4) rem($spacer-unit * 2);
    }
  }

  &__brand {
    flex: 0 1 80%;
    max-width: $logo-width;

    @media (min-width: $md) {
      max-width: $logo-width;
    }

    &-link {
      display: block;
    }

    &-logo {
      display: block;
      height: auto;
      max-width: 100%;
    }
  }

  &__menu {
    transition: max-height 0.3s ease;
    max-height: 0;
    overflow: hidden;
    width: 100%;

    @media (min-width: $md) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      max-height: none;
      width: auto;
    }

    &.is-active {
      width: 100%;
      max-height: 100vh;

      @media (min-width: $md) {
        width: auto;
      }
    }

    &-toggle {
      appearance: none;
      background: transparent;
      border: 0;
      margin-left: auto;
      margin-top: 24px;
      flex: 0 0 24px;
      display: block;
      height: 32px;
      width: 32px;
      text-decoration: none;
      position: relative;

      @media (min-width: $md) {
        display: none;
      }

      .bar {
        display: block;
        width: 32px;
        height: 6px;
        background: $black;
        position: absolute;
        right: 0;
        top: 0;
        transition: 0.25s ease-in-out;
        border-radius: 3px;

        &:nth-child(2) {
          top: calc(50% - 1px);
        }

        &:nth-child(3) {
          top: calc(100% - 2px);
        }
      }

      &.is-active {
        z-index: 100;

        .bar {
          &:nth-child(1) {
            top: 50%;
            transform: rotate(135deg);
          }

          &:nth-child(2) {
            opacity: 0;
          }

          &:nth-child(3) {
            top: 50%;
            transform: rotate(-135deg);
          }
        }
      }
    }
  }
}

.c-menu {
  @include th2;
  & {
    color: $menu-link-color;
    display: flex;
    flex-direction: column;
    align-items: center;
    list-style: none;
    text-align: center;
    padding-top: rem($spacer-unit * 4);
  }

  @media (min-width: $md) {
    @include tbody;

    flex-direction: row;
    flex-wrap: wrap;
    flex: 1;
    text-align: left;
    padding: 0 0 0 rem($spacer-unit * 4);
    margin: 0;
    justify-content: flex-end;
  }

  &__item {
    margin-bottom: rem($spacer-unit * 2);
    padding: 16px 32px;
    font-family: $font-headline;

    @media (min-width: $md) {
      margin-bottom: 0;
    }

    &::before {
      display: none;
    }
  }

  &__link {
    color: $black;
    text-decoration: none;
    text-transform: uppercase;

    &:hover {
      color: $black;
      text-decoration: underline;
    }

    &--icon {
      @include border-link;

      & {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: rem($spacer-unit * 2);
        transition: all 0.15s ease-in-out;
      }

      &:hover {
        background-color: $black;
        color: $white;
        text-decoration: none;

        svg {
          fill: $white;
        }
      }

      @media (min-width: $md) {
        padding: rem($spacer-unit) rem($spacer-unit * 2);
      }
    }
  }

  &__icon {
    margin-right: rem($spacer-unit);
    display: block;
    width: 20px;
    height: 20px;

    svg {
      transform: translateY(-16px);

      @media (min-width: $md) {
        transform: translateY(0);
      }
    }
  }
}

.c-disclaimer {
  @include overline;
  & {
    text-transform: none;
    color: $secondary-dark;
    background-color: $yellow;
    padding: rem($spacer-unit) rem($spacer-unit * 2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  a,
  button {
    color: $secondary-dark;
    text-decoration: none;
    margin-left: auto;

    img {
      height: 25px;
      width: auto;
      padding-right: 5px;
      vertical-align: middle;
    }
  }

  button {
    background: none;
    border: none;
  }
}
</style>
