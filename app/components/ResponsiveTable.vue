<template>
  <table class="c-responsive-table">
    <thead>
      <tr>
        <th v-for="column in columns" v-bind:key="column">{{ column }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" v-bind:key="index">
        <td
          v-for="(item, item_index) in row"
          v-bind:key="index + '-' + item_index"
          :data-title="getColumn(item_index)"
        >
          {{ item }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const { columns, rows } = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
});

const getColumn = (index) => {
  return columns[index];
};
</script>
