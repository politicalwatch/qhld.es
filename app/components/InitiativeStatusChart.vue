<template>
  <div class="c-status-chart">
    <h2>Estado de las iniciativas</h2>

    <!-- Plot area: position:relative so tooltip coords align with svg origin -->
    <div class="c-status-chart__plot" ref="chartWrapper">
      <!-- Tooltip -->
      <Transition name="tooltip-fade">
        <div
          v-if="activeBar"
          class="c-status-chart__tooltip"
          :class="{ 'is-flipped': tooltipFlipped }"
          :style="tooltipStyle"
        >
          <span class="c-status-chart__tooltip-label">{{ activeBar.label }}</span>
          <span class="c-status-chart__tooltip-value">
            <span
              class="c-status-chart__tooltip-swatch"
              :style="{ backgroundColor: activeBar.color }"
            ></span>
            {{ activeBar.value }}
          </span>
        </div>
      </Transition>

    <svg :width="availableWidth" :height="availableHeight">
      <!-- X-axis: baseline + gridlines + tick labels -->
      <g class="axis xaxis" :transform="`translate(${margin.left}, ${margin.top})`">
        <line class="baseline" x1="0" :x2="width" :y1="height" :y2="height" />
        <g
          v-for="tick in xTicks"
          :key="tick"
          :transform="`translate(${xScale(tick)}, 0)`"
        >
          <line class="gridline" x1="0" x2="0" y1="0" :y2="height" />
          <text :y="height + 20" text-anchor="middle">{{ tick }}</text>
        </g>
      </g>

      <!-- Y-axis: category labels -->
      <g class="axis yaxis" :transform="`translate(${margin.left}, ${margin.top})`">
        <text
          v-for="bar in bars"
          :key="bar.label"
          :y="yScale(bar.label) + yScale.bandwidth() / 2"
          x="-10"
          text-anchor="end"
          dominant-baseline="middle"
        >{{ bar.label }}</text>
      </g>

      <!-- Bars -->
      <g class="bars" :transform="`translate(${margin.left}, ${margin.top})`">
        <rect
          v-for="(bar, index) in bars"
          :key="bar.label"
          x="0"
          :y="yScale(bar.label)"
          :height="yScale.bandwidth()"
          :fill="bar.color"
          v-tr3nsition:init="{ width: 0 }"
          v-tr3nsition:to="{
            width: xScale(bar.value) > 0 ? xScale(bar.value) : 0.00001,
            transition: { duration: 500, delay: index * 100 },
          }"
        />

        <!-- Full-row hover overlays (wider target, like FrequencyChart bar-background) -->
        <rect
          v-for="bar in bars"
          :key="`hover-${bar.label}`"
          x="0"
          :y="yScale(bar.label)"
          :width="width"
          :height="yScale.bandwidth()"
          fill="transparent"
          class="bar-hover"
          @mouseover="activeBar = bar"
          @mouseout="activeBar = null"
        />
      </g>
    </svg>
    </div><!-- /.c-status-chart__plot -->
  </div>
</template>

<script setup>
import { scaleLinear, scaleBand } from "d3";
import vTr3nsition from "@/components/vTr3nsition.js";

const { initiativesStats } = defineProps({
  initiativesStats: {
    type: Object,
    required: true,
  },
});

// ── Data ──────────────────────────────────────────────────────────────────────
const bars = computed(() => [
  { label: "Aprobadas", value: initiativesStats.approved,  color: "#4dca7f" },
  { label: "En proceso", value: initiativesStats.inProcess, color: "#ddd"    },
  { label: "Rechazadas", value: initiativesStats.rejected,  color: "#e81c1c" },
]);

// ── Responsive sizing (mirrors FrequencyChart pattern) ────────────────────────
const chartWrapper = useTemplateRef("chartWrapper");
const { width: availableWidth } = useElementSize(chartWrapper);
const availableHeight = computed(() => availableWidth.value / 3);

const margin = { top: 10, right: 20, bottom: 30, left: 90 };
const width  = computed(() => availableWidth.value - margin.left - margin.right);
const height = computed(() => availableHeight.value - margin.top  - margin.bottom);

// ── Scales ────────────────────────────────────────────────────────────────────
const xScale = computed(() => {
  const maxVal = Math.max(...bars.value.map((b) => b.value), 0);
  return scaleLinear()
    .domain([0, maxVal])
    .range([0, width.value])
    .nice();
});

const yScale = computed(() =>
  scaleBand()
    .domain(bars.value.map((b) => b.label))
    .range([0, height.value])
    .paddingInner(0.65)
    .paddingOuter(0.25)
);

const xTicks = computed(() => xScale.value.ticks(6));

// ── Tooltip ───────────────────────────────────────────────────────────────────
const activeBar = ref(null);

// Flip tooltip to the left when bar end is past 65% of chart width
const tooltipFlipped = computed(() => {
  if (!activeBar.value) return false;
  return xScale.value(activeBar.value.value) > width.value * 0.65;
});

const tooltipStyle = computed(() => {
  if (!activeBar.value) return {};
  const barEndX = margin.left + xScale.value(activeBar.value.value);
  const barMidY = margin.top + yScale.value(activeBar.value.label) + yScale.value.bandwidth() / 2;
  return {
    left: `${barEndX}px`,
    top:  `${barMidY}px`,
    // 6px offset = caret width; keeps the caret tip flush with the bar end
    transform: tooltipFlipped.value
      ? "translate(calc(-100% - 6px), -50%)"
      : "translate(6px, -50%)",
  };
});
</script>

<style scoped>
.c-status-chart {
  max-width: calc(100vw - 32px);
}

/* Positioning context for the tooltip; wraps only the svg, not the h2 */
.c-status-chart__plot {
  position: relative;
}

h2 {
  text-transform: uppercase;
}

/* Axis */
.axis text {
  font-size: 0.8rem;
  fill: #9cb0bf;
}
.axis .baseline {
  stroke: #9cb0bf;
  stroke-width: 1;
}
.axis .gridline {
  stroke: #9cb0bf;
  stroke-opacity: 0.2;
}

/* Hover overlay */
.bar-hover {
  cursor: default;
}

/* Tooltip */
.c-status-chart__tooltip {
  position: absolute;
  z-index: 10;
  background: #222;
  color: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Caret: default → box is to the right of bar end, caret points left */
.c-status-chart__tooltip::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #222;
}

/* Flipped → box is to the left of bar end, caret points right */
.c-status-chart__tooltip.is-flipped::before {
  left: auto;
  right: -6px;
  border-right: none;
  border-left: 6px solid #222;
}

.c-status-chart__tooltip-label {
  font-size: 0.8rem;
  font-weight: bold;
}

.c-status-chart__tooltip-value {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.c-status-chart__tooltip-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* Tooltip fade transition */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.1s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
