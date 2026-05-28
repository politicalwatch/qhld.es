<template>
  <div class="frequency-chart-wrapper" ref="chartWrapper">
    <svg :width="availableWidth" :height="availableHeight">
      <g class="top-text" :transform="`translate(${margin.left}, 0)`">
        <text
          v-if="activeBar"
          font-size="0.8rem"
          font-weight="light"
          fill="#9cb0bf"
          :text-anchor="
            xScale(activeBar.week) < 50
              ? 'start'
              : xScale(activeBar.week) > width - 30
                ? 'end'
                : 'middle'
          "
        >
          <tspan :x="xScale(activeBar.week)" :y="margin.top / 2">
            Semana {{ activeBar.week.split("-")[1] }} ({{
              formatActiveWeekMonday
            }})
          </tspan>
          <tspan dy="1em" :x="xScale(activeBar.week)" :y="margin.top / 2">
            Iniciativas:
            <tspan font-weight="bold">{{ activeBar.initiatives }}</tspan>
          </tspan>
        </text>
      </g>
      <!--  axis -->
      <g
        class="axis yaxis"
        :transform="`translate(${margin.left - MARGIN_AXIS}, ${margin.top})`"
      >
        <!-- vertical line for y axis-->
        <!-- <line x1="0" x2="0" :y1="height" :y2="0" /> -->
        <g
          class="tick"
          v-for="(tick, index) in yScale.nice().ticks(5)"
          :key="index"
          :transform="`translate(0, ${yScale(tick)})`"
        >
          <line x1="-6" :x2="width" class="ticks" />
          <text x="-9" dy=".32em" text-anchor="end">
            {{ tick }}
          </text>
        </g>
      </g>

      <g
        class="axis xaxis"
        :transform="`translate(${margin.left},${margin.top})`"
      >
        <!-- horizontal line for x axis-->
        <line
          :y1="height"
          :y2="height"
          :x1="0"
          :x2="width"
          stroke="currentColor"
          stroke-width="1"
        ></line>
        <g
          class="tick"
          v-for="(tick, index) in xScaleTicks"
          :key="index"
          :transform="`translate(${xScaleTimeForAxis(
            xScaleTicksPositions[index]
          )}, ${height + 20})`"
        >
          <line x1="0" x2="0" y1="0" y2="6" />
          <text y="9" dy=".71em" text-anchor="middle">
            {{ tick }}
          </text>
        </g>
      </g>

      <!-- bars -->
      <g class="rects" :transform="`translate(${margin.left}, ${margin.top})`">
        <g
          v-for="(bar, index) in bars"
          :key="multiYearMode ? bar.week.split('-')[1] : bar.week"
        >
          <!-- a "background rect" invisible ocupying full height above each one of the previous rects useful only for interaction-->
          <rect
            :x="xScale(bar.week)"
            :y="0"
            :width="barWidth"
            :height="height"
            class="bar-background"
            :class="{
              active: activeBar && activeBar.week === bar.week,
            }"
            @mouseover="activeBar = bar"
            @mouseout="activeBar = null"
            @click="searchWeekInitiatives(bar)"
          ></rect>
          <!-- visible-->
          <rect
            :x="xScale(bar.week)"
            :width="barWidth"
            v-tr3nsition:init="{
              height: 0,
              y: height,
            }"
            v-tr3nsition:to="{
              height:
                height - yScale(bar.initiatives) <= 0
                  ? 0.00001
                  : height - yScale(bar.initiatives),
              y: yScale(bar.initiatives),
              transition: {
                duration: 60,
                delay: index * 15,
              },
            }"
            :class="{
              active: activeBar && activeBar.week === bar.week,
            }"
            class="bar"
            :style="{
              fill: currentStyle.color_alt
                ? currentStyle.color_alt
                : currentStyle.color,
              stroke: currentStyle.color_alt
                ? currentStyle.color_alt
                : currentStyle.color,
            }"
          />

          <!-- a line above the rect on its top side-->
          <line
            :x1="xScale(bar.week)"
            :x2="xScale(bar.week) + barWidth"
            v-tr3nsition:init="{
              y1: height,
              y2: height,
            }"
            v-tr3nsition:to="{
              y1: yScale(bar.initiatives),
              y2: yScale(bar.initiatives),
              transition: {
                duration: 600,
                delay: index * 15,
              },
            }"
            :stroke="
              currentStyle.color_alt
                ? currentStyle.color_alt
                : currentStyle.color
            "
            stroke-width="3"
          ></line>
        </g>
        <g v-if="isRelativeModeReady">
          <g v-for="(bar, index) in aggregatedBars" :key="index">
            <rect
              :x="xScale(bar.week)"
              :width="barWidth"
              v-tr3nsition:init="{
                height: 0,
                y: height,
              }"
              v-tr3nsition:to="{
                height:
                  height - yScale(bar.initiatives) <= 0
                    ? 0.00001
                    : height - yScale(bar.initiatives),
                y: yScale(bar.initiatives),
                transition: {
                  duration: 60,
                  delay: index * 15,
                },
              }"
              class="bar"
              :style="{
                fill: '#333',
                stroke: 'transparent',
              }"
            />
          </g>
        </g>
      </g>
    </svg>
    <div class="controls-container o-grid">
      <div class="o-grid__col u-12 u-9@sm u-margin-bottom-2">
        <div class="yearSelectors" v-if="multiYearMode">
          <a
            href="#"
            class="c-button c-button--compact"
            :class="{
              'c-button--secondary': activeYear != year,
              'c-button--primary': activeYear == year,
            }"
            v-for="year in datasetAnalytics.allYears"
            :key="year"
            @click.prevent="activeYear = year"
            >{{ year }}</a
          >
        </div>
      </div>
      <div class="o-grid__col u-12 u-3@sm u-margin-bottom-2">
        <div class="rangeSwitches">
          <UiSwitch
            label="Comparar con toda la actividad"
            :checked="showComparativeMode"
            @update:checked="showComparativeMode = $event"
          ></UiSwitch>
          <UiSwitch
            v-if="availableMultiYearOptions"
            label="Mostrar todo el periodo"
            :checked="forceSingleYearMode"
            @update:checked="forceSingleYearMode = $event"
            datasetAnalytics.value.countYears
          >
            1 >
          </UiSwitch>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// test at http://localhost:5173/ods/ods-2

/* component functionality
Displays one barchart for the evolution of the topic
The chart can be displayed in two modes:
- All data: the chart displays the evolution of the topic for all years in the dataset
- multi year mode: the chart displays the evolution of the topic for the selected year. Only available if there is more than one year in the dataset
This is controled by the multiYearMode computed property and availableMultiYearOptions.

-- comparative mode --
The chart can also display the evolution of the topic compared to the evolution of all topics.
This is controled by the showComparativeMode computed property and the showComparativeMode switch
Since the default state is false, the chart will display the evolution of the topic only.
To avoid loading unused data, the dataset for the aggregated dataset is provided by the parent component when the user clicks on the relative mode switch
*/

import {
  ref,
  computed,
  onMounted,
  nextTick,
  onUnmounted,
  watch,
  useTemplateRef,
} from "vue";
import { useElementSize } from "@vueuse/core";
import { setWeek, startOfWeek, endOfWeek, format } from "date-fns";
import { useRouter } from "vue-router";
import {
  min,
  max,
  range,
  scaleBand,
  timeFormat,
  timeWeek,
  timeMonth,
  scaleLinear,
  scaleTime,
} from "d3";
import vTr3nsition from "@/components/vTr3nsition.js";
import UiSwitch from "@/components/UiSwitch.vue";

const router = useRouter();

const { defaultHeight, topicsStyles, topic, dataset, aggreagatedDataset } =
  defineProps({
    defaultHeight: {
      type: Number,
      default: 800,
    },

    topicsStyles: {
      type: Object,
      required: true,
    },
    topic: {
      type: Object,
      default: () => ({
        knowledgebase: "ods",
        name: "ODS 2 Hambre cero",
        shortname: "ODS 2",
        id: "ods-2",
        description: [
          "Poner fin al hambre, lograr la seguridad alimentaria y la mejora de la nutrición y promover la agricultura sostenible",
        ],
      }),
    },
    /*
  dataset is an array of objects with the format {week: '2021-01', initiatives: 10}
  It is the dataset for the selected topic
  if dataset is provided as null value, component might fail
  if dataset is provided as an empty array, component will generate a random dataset
  */
    dataset: {
      type: Array,
      default: () => [[]],
    },
    /*
  aggreagatedDataset is an array of objects with the format {week: '2021-01', initiatives: 10}
  It is the dataset for the aggregation of all topics.
  It can be provided later on, when the user clicks on the relative mode switch
  */
    aggreagatedDataset: {
      type: [null, Array],
      default: () => [[]],
    },
  });

//*** set responsive width and  heights */
const chartWrapper = useTemplateRef("chartWrapper"); // wrapper for the svg. Template reference
/* svg size */
const { width: availableWidth } = useElementSize(chartWrapper);
const availableHeight = ref(defaultHeight);

const margin = { top: 40, right: 60, bottom: 60, left: 50 };
const MARGIN_AXIS = 10;

/* chart size inside the axis*/
const width = computed(() => availableWidth.value - margin.left - margin.right);
const height = computed(
  () => availableHeight.value - margin.top - margin.bottom
);
//**** end of size block**************** ***/

const currentStyle = computed(() => topicsStyles[topic.name]);

const data = computed(() => {
  if (dataset.length > 0) {
    // props .dataset.weeks is a string with the format YYYY-WW where WW is the week number
    return dataset;
  } else {
    // if dataset is empty generate data points for a full year one for each week:
    const arr = [];
    for (let i = 0; i < 90; i++) {
      arr.push({
        week: timeFormat("%Y-%W")(timeWeek.offset(new Date("2022-01-01"), i)),
        initiatives: Math.floor(Math.random() * 100),
      });
    }

    return arr;
  }
});

/*** blocks analyze the different datasets and compute analytics ************************/

/* analytics for all years ****/
const datasetAnalytics = computed(() => {
  // data.value contais the an array of objects with the format {week: '2021-01', initiatives: 10}
  const a = {
    initDate: min(data.value, (d) => d.week),
    endDate: max(data.value, (d) => d.week),
    firstYear: min(data.value, (d) => d.week).split("-")[0],
    lastYear: max(data.value, (d) => d.week).split("-")[0],
    maxInitiatives: max(data.value, (d) => d.initiatives),
    minInitiatives: min(data.value, (d) => d.initiatives),
  };
  // allyears is an array going from firstYear to lastYear (both included)
  a.countYears = parseInt(a.lastYear) - parseInt(a.firstYear);

  a.allYears = range(parseInt(a.firstYear), parseInt(a.lastYear) + 1);
  return a;
});

/* analytics for the aggreagated dataset ****/
const aggreagatedDatasetAnalytics = computed(() => {
  if (aggreagatedDataset == null || aggreagatedDataset.length == 0) return null;
  const a = {
    initDate: min(aggreagatedDataset, (d) => d.week),
    endDate: max(aggreagatedDataset, (d) => d.week),
    firstYear: min(aggreagatedDataset, (d) => d.week).split("-")[0],
    lastYear: max(aggreagatedDataset, (d) => d.week).split("-")[0],
    maxInitiatives: max(aggreagatedDataset, (d) => d.initiatives),
    minInitiatives: min(aggreagatedDataset, (d) => d.initiatives),
  };
  // allyears is an array going from firstYear to lastYear (both included)
  a.countYears = parseInt(a.lastYear) - parseInt(a.firstYear);

  a.allYears = range(parseInt(a.firstYear), parseInt(a.lastYear) + 1);
  return a;
});

/* active data is the data for the selected year or the full dataset depenending on multiYearMode */
const activeData = computed(() => {
  if (multiYearMode.value === true)
    return data.value.filter((d) => d.week.split("-")[0] == activeYear.value);
  else return data.value;
});

const activeDataAggregated = computed(() => {
  if (multiYearMode.value === true)
    return aggreagatedDataset.filter(
      (d) => d.week.split("-")[0] == activeYear.value
    );
  else return aggreagatedDataset;
});

/*
 * activeDataAnalytics are the analytics for the activeData: i
 if multiYearMode is true, activeDataAnalytics is the analytics for the selected year
  if multiYearMode is false, activeDataAnalytics is the analytics for the full dataset
 */
const activeDataAnalytics = computed(() => {
  if (
    multiYearMode.value === true &&
    activeData.value != null &&
    activeData.value.length > 0
  ) {
    return {
      initDate: min(activeData.value, (d) => d.week),
      endDate: max(activeData.value, (d) => d.week),
      firstYear: min(activeData.value, (d) => d.week).split("-")[0],
      lastYear: max(activeData.value, (d) => d.week).split("-")[0],
      maxInitiatives: max(activeData.value, (d) => d.initiatives),
      minInitiatives: min(activeData.value, (d) => d.initiatives),
    };
  } else return datasetAnalytics.value;
});

/*** scales for charts
 * To set the domains we take into account the mode (multiYearMode) and if aggregated data is also on the chart
 */

// xScale is a band scale with the weeks as domain
const xScale = computed(() =>
  multiYearMode.value === true
    ? scaleBand()
        .domain(
          range(52).map(
            (d) =>
              activeDataAnalytics.value.firstYear +
              "-" +
              ("0" + (d + 1)).slice(-2)
          )
        )
        .range([0, width.value])
        .padding(0)
    : scaleBand()
        .domain(activeData.value.map((d) => d.week))
        .range([0, width.value])
        .padding(0)
);

// xScaleTimeForAxis is used to plot the ticks on the x axis. We define a continuous scale based on the first and last week of the dataset
const xScaleTimeForAxis = computed(() => {
  const week0 = xScale.value?.domain()[0];
  const week1 = xScale.value?.domain()[xScale.value?.domain().length - 1];
  const scale = scaleTime()
    .domain([
      new Date(getYearWeekRange(week0).monday),
      new Date(getYearWeekRange(week1).sunday),
    ])
    .range([0, width.value]);

  return scale;
});
// this are the actual ticks for the x axis, label and positions
const xScaleTicks = computed(() => {
  const format = timeFormat("%b %Y"); // short version of the date
  return xScaleTimeForAxis.value.ticks(timeMonth.every(3)).map(format); // ticks every 3 months
});

const xScaleTicksPositions = computed(() =>
  xScaleTimeForAxis.value.ticks(timeMonth.every(3))
);

const yScale = computed(() =>
  isRelativeModeReady.value
    ? scaleLinear()
        .domain([0, aggreagatedDatasetAnalytics.value.maxInitiatives])
        .range([height.value, 0])
    : scaleLinear()
        .domain([0, datasetAnalytics.value.maxInitiatives])
        .range([height.value, 0])
);

const barWidth = computed(() => xScale.value.bandwidth());
const bars = computed(() => activeData.value);
const aggregatedBars = computed(() => activeDataAggregated.value);

//** interaction block*/
const activeBar = ref(null);
const activeYear = ref(null);
const forceSingleYearMode = ref(false);

// multiYearMode is true if there is more than one year in the dataset and forceSingleYearMode is false.
const availableMultiYearOptions = computed(
  () => datasetAnalytics.value.countYears > 1
);
const multiYearMode = computed(
  () => availableMultiYearOptions.value && !forceSingleYearMode.value
);

onMounted(() => {
  // Code to fetch data and update the 'data' ref can be added here
  nextTick(() => {
    activeYear.value = datasetAnalytics.value.lastYear;
  });
});
const theme = ref({
  lightGray: "#9cb0bf",
});

// relative view
const emit = defineEmits(["update:showComparativeMode"]);

const showComparativeMode = ref(false);
watch(showComparativeMode, (newValue, oldValue) => {
  emit("update:showComparativeMode", newValue);
});

const isRelativeModeReady = computed(
  () => showComparativeMode.value === true && aggreagatedDataset?.length > 0
);

const getYearWeekRange = (yearWeek) => {
  let [year, week] = yearWeek.split("-").map(Number);
  let baseDate = new Date(year, 0, 4);
  let weekDate = setWeek(baseDate, week, {
    weekStartsOn: 1,
    firstWeekContainsDate: 4,
  });
  let monday = startOfWeek(weekDate, { weekStartsOn: 1 });
  let sunday = endOfWeek(weekDate, { weekStartsOn: 1 });

  return {
    monday: format(monday, "yyyy-MM-dd"),
    sunday: format(sunday, "yyyy-MM-dd"),
  };
};

const formatActiveWeekMonday = computed(() => {
  if (activeBar.value) {
    return new Date(
      getYearWeekRange(activeBar.value.week).monday
    ).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
    });
  }
});

const searchWeekInitiatives = (bar) => {
  let weekRange = getYearWeekRange(bar.week);
  let topic = topic.name;

  const data = `topic=${topic}&startdate=${weekRange.monday}&enddate=${weekRange.sunday}&knowledgebase=politicas`;

  router.push({
    name: "results",
    params: { data },
  });
};
</script>

<style scoped>
.bar {
  fill-opacity: 0.1;
  stroke-opacity: 0.05;
  pointer-events: none;
  transition: 0.1s;
}
.bar:hover,
.bar.active {
  fill-opacity: 1;
  stroke-opacity: 1;
}

.bar-background {
  fill: transparent;
}
.bar-background.active {
  fill: #f8f8f8;
  transition: 0.1s;
}

.axis text {
  font-size: 0.8rem;
  font-weight: light;
  fill: v-bind("theme.lightGray");
}
.axis line {
  stroke: v-bind("theme.lightGray");
}
.axis line.ticks {
  stroke-opacity: 0.2;
}

.yearSelectors {
  display: flex;
  justify-content: center;

  gap: 2px;
}
.yearSelectors a:first-child {
  border-radius: 0.4rem 0 0 0.4rem;
}
.yearSelectors a:last-child {
  border-radius: 0 0.4rem 0.4rem 0;
}
.yearSelectors a {
  border-radius: 0;
}

.rangeSwitches {
  display: flex;
  justify-content: center;
  gap: 2px;

  @media (min-width: 768px) {
    flex-direction: column;
  }
}

.controls-container {
  align-items: center;
  margin-top: 0rem;
}
.frequency-chart-wrapper {
  max-width: calc(100vw - 32px);
  margin-bottom: 1rem;
}
</style>
