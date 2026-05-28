<template>
  <div
    class="tooltip__container"
    @mouseover="showTooltip"
    @mouseleave="hideTooltip"
  >
    <div class="tooltip__trigger" ref="triggerRef">
      <slot></slot>
    </div>

    <div
      v-show="visible"
      :class="['tooltip', `tooltip--${position}`]"
      :style="tooltipStyle"
      ref="tooltipRef"
    >
      <div class="tooltip__content" v-html="text" />

      <router-link
        v-if="routeLink"
        :to="{ name: routeLink }"
        target="_blank"
        class="tooltip__link"
      >
        Ver más
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useElementBounding } from "@vueuse/core";

const { text, position, routeLink } = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "top",
  },
  routeLink: {
    type: String,
  },
});

const visible = ref(false);
const tooltipStyle = ref({});
const triggerRef = ref(null);
const tooltipRef = ref(null);

const { width: triggerWidth, height: triggerHeight } =
  useElementBounding(triggerRef);
const { width, height } = useElementBounding(tooltipRef);

const showTooltip = async () => {
  visible.value = true;
  await nextTick();

  switch (position) {
    case "top":
      tooltipStyle.value = {
        bottom: `${triggerHeight.value + 10}px`,
        left: `${(triggerWidth.value - width.value) / 2}px`,
      };
      break;
    case "bottom":
      tooltipStyle.value = {
        top: `${triggerHeight.value + 10}px`,
        left: `${(triggerWidth.value - width.value) / 2}px`,
      };
      break;
    case "left":
      tooltipStyle.value = {
        bottom: `${(triggerHeight.value - height.value) / 2}px`,
        left: `${-width.value - 10}px`,
      };
      break;
    case "right":
      tooltipStyle.value = {
        bottom: `${(triggerHeight.value - height.value) / 2}px`,
        left: `${triggerWidth.value + 10}px`,
      };
      break;
  }
};

const hideTooltip = () => {
  visible.value = false;
};
</script>

<style lang="scss" scoped>
.tooltip__container {
  position: relative;
  display: inline-block;
}

:deep(.tooltip__content) {
  p {
    margin-top: 0;
    margin-bottom: 1rem;
    line-height: 1.4;
  }
}

.tooltip__link {
  display: inline-block;
  text-decoration: none;
  padding: 10px 15px;
  background: $yellow;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 20px;
  border-radius: 3px;
  z-index: 1000;
  width: max-content;
  max-width: min(70vw, 500px);
  transition: all 0.3s;

  &::before {
    content: "";
    position: absolute;
    border-style: solid;
  }

  &.tooltip--top::before {
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 10px 10px 0 10px;
    border-color: #333 transparent transparent transparent;
  }

  &.tooltip--bottom::before {
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 10px 10px 10px;
    border-color: transparent transparent #333 transparent;
  }

  &.tooltip--left::before {
    top: 50%;
    right: -10px;
    transform: translateY(-50%);
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent #333;
  }

  &.tooltip--right::before {
    top: 50%;
    left: -10px;
    transform: translateY(-50%);
    border-width: 10px 10px 10px 0;
    border-color: transparent #333 transparent transparent;
  }
}
</style>
