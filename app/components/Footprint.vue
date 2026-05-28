<template>
  <div class="c-footprint" :class="{ 'c-footprint--small': isSmall() }">
    <span class="c-footprint__wrapper">
      <icon icon="mdi:bar-chart" :height="18" /><span>{{ footprint }} <small>/ 100</small></span>
    </span>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { footprint, small } = defineProps({
  footprint: [Number, String],
  small: Boolean,
});

const isSmall = () => {
  return small ? true : false;
};
</script>

<style lang="scss" scoped>
.c-footprint {
  margin-bottom: 8px;

  &--small {
    .c-footprint {
      &__wrapper {
        font-size: 12px;
        padding: 4px 6px;

        .c-icon {
          padding-right: 4px;

          svg {
            width: 12px;
            height: 12px;
          }
        }
      }
    }
  }

  &__wrapper {
    background-color: $tipi-yellow;
    padding: 6px 8px;
    font-family: $font-headline;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .c-icon {
    padding-right: 8px;
  }
}
</style>
