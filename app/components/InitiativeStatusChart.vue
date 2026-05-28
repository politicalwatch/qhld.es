<template>
  <div>
    <h2>Estado de las iniciativas</h2>
    <Bar :data="data" :options="options" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "vue-chartjs";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const { initiativesStats } = defineProps({
  initiativesStats: {
    type: Object,
    required: true,
  },
});

const data = computed(() => ({
  labels: ["Aprobadas", "En proceso", "Rechazadas"],
  datasets: [
    {
      backgroundColor: ["#4dca7f", "#ddd", "#e81c1c"],
      data: [
        initiativesStats.approved,
        initiativesStats.inProcess,
        initiativesStats.rejected,
      ],
      barThickness: 20,
    },
  ],
}));

const options = {
  indexAxis: "y",
  responsive: true,
  aspectRatio: 3 / 1,
  scales: {
    y: {
      grid: {
        display: false,
      },
      ticks: {
        padding: 10,
      },
    },
    x: {
      grid: {
        display: true,
      },
    },
  },
  elements: {
    bar: {},
  },
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  text-transform: uppercase;
}
</style>
