<template>
  <div :class="`c-message c-message--${type} ${icon ? 'c-message--icon' : ''}`">
    <div class="c-message__wrapper">
      <icon class="c-message__icon" v-if="icon" :icon="getIcon()" />
      <slot />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { type, icon } = defineProps({
  type: {
    type: String,
    default: "success",
    validator: (value) => {
      return ["success", "error", "info"].includes(value);
    },
  },
  icon: {
    type: Boolean,
    default: false,
  },
});

const getIcon = () => {
  const map = {
    success: "mdi:check-bold",
    error: "mdi:alert-circle",
    info: "mdi:information",
  };

  return icon ? map[type] : null;
};
</script>

<style lang="scss" scoped>
.c-message {
  margin-bottom: rem($spacer-unit * 2);

  &__wrapper {
    @include tbody2;

    display: inline-block;
    padding: rem($spacer-unit * 2) rem($spacer-unit * 4);
    background-color: $completed;
    color: $white;
    position: relative;
  }

  &__icon {
    position: absolute;
    left: rem($spacer-unit * 2);
    margin-top: rem(calc($spacer-unit / 4));

    svg {
      path {
        fill: $white;
      }
    }
  }

  &--error {
    .c-message {
      &__wrapper {
        background-color: $error;
      }
    }
  }

  &--info {
    .c-message {
      &__wrapper {
        color: $secondary-dark;
        background-color: $secondary-light;
      }

      &__icon {
        svg {
          path {
            fill: $secondary;
          }
        }
      }
    }
  }

  &--icon {
    .c-message {
      &__wrapper {
        padding-left: rem($spacer-unit * 5);
      }
    }
  }

  &.u-block {
    .c-message {
      &__wrapper {
        display: block;
      }
    }
  }
}
</style>
