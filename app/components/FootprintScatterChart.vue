<template>
  <div class="footprint-scatter-chart-wrapper" ref="chartWrapper">
    <svg :width="availableWidth" :height="availableHeight">
      <g ref="scatterPlotGroup" />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from "vue";
import { scaleLinear, axisBottom, axisLeft, select } from "d3";

const { dataset, defaultHeight } = defineProps({
  dataset: {
    type: Array,
    default: () => [],
  },
  defaultHeight: {
    type: Number,
    default: 400,
  },
});
const availableWidth = ref(800);
const availableHeight = ref(defaultHeight);

const chartWrapper = ref(null);
const scatterPlotGroup = ref(null);

const maxValue = computed(() => {
  return Math.max(...dataset.map((d) => d.y));
});

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = availableWidth.value - margin.left - margin.right;
const height = availableHeight.value - margin.top - margin.bottom;

const xScale = scaleLinear().domain([-100, 100]).range([0, width]);
const yScale = scaleLinear().domain([0, maxValue.value]).range([height, 0]);

onMounted(() => {
  if (dataset?.length > 0) {
    drawChart();
  }
});

const drawChart = () => {
  console.log("Drawing chart");
  const svg = select("svg");
  const g = select(scatterPlotGroup.value);

  g.attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(axisBottom(xScale));

  g.append("g").call(axisLeft(yScale));

  g.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 5)
    .attr("fill", (d) => d.color);
};

watch(
  () => dataset,
  (newData) => {
    drawChart();
  }
);
</script>

<style lang="scss" scoped>
.footprint-scatter-chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
