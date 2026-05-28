<template>
  <h5 class="u-uppercase c-csv-download" v-show="initiatives.length">
    <a
      v-if="!csvItems.length"
      :class="{ disabled: !canDownloadCSV }"
      :title="
        !canDownloadCSV
          ? 'Demasiados resultados para poder descargar. Afina la búsqueda'
          : 'Descarga CSV con todos los resultados'
      "
      @click.prevent="loadCSVItems"
      href="#"
    >
      <span class="c-icon c-icon--type-download">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="16"
          fill="none"
          viewBox="0 0 12 16"
        >
          <path
            fill="#2D4252"
            d="M12 5.647H8.571V0H3.43v5.647H0l6 6.588 6-6.588zm-12 8.47V16h12v-1.882H0z"
          ></path>
        </svg>
      </span>
      {{ label }}
    </a>
    <json-excel
      v-else
      :data="csvItems"
      :fields="csvFields"
      :escapeCsv="false"
      :meta="json_meta"
      type="csv"
      :name="getNameFromCSV()"
      id="downloadCSV"
    >
      <span class="c-icon c-icon--type-download">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="16"
          fill="none"
          viewBox="0 0 12 16"
        >
          <path
            fill="#2D4252"
            d="M12 5.647H8.571V0H3.43v5.647H0l6 6.588 6-6.588zm-12 8.47V16h12v-1.882H0z"
          ></path>
        </svg>
      </span>
      {{ label }}
    </json-excel>
  </h5>
</template>

<script setup>
import JsonExcel from "vue-json-excel3";

const { initiatives, csvItems, canDownloadCSV, csvFields, label, buttonClass } =
  defineProps({
    initiatives: {
      type: Array,
      default: () => [],
    },
    csvItems: Array,
    canDownloadCSV: Boolean,
    csvFields: {
      type: Object,
      default: () => ({
        title: {
          field: "title",
          callback: (value) => `"${value.replace(/\n/g, " ")}"`,
        },
        reference: "reference",
        initiative_type_alt: "initiative_type_alt",
        authors: {
          field: "authors",
          callback: (value) => `"${value.join("; ").replace(/\n/g, " ")}"`,
        },
        deputies: {
          field: "deputies",
          callback: (value) => `"${value.join("; ").replace(/\n/g, " ")}"`,
        },
        topics: {
          field: "topics",
          callback: (value) => `"${value.replace(/\n/g, " ")}"`,
        },
        tags: {
          field: "tags",
          callback: (value) => `"${value.replace(/\n/g, " ")}"`,
        },
        place: {
          field: "place",
          callback: (value) => `"${value.replace(/\n/g, " ")}"`,
        },
        status: "status",
        created: "created",
        updated: "updated",
        url: "url",
      }),
    },
    label: {
      type: String,
      default: "Descarga los datos",
    },
    buttonClass: {
      type: String,
      default: "c-button--compact",
    },
  });

const emit = defineEmits(["loadCSVItems"]);

const json_meta = [
  [
    {
      key: "charset",
      value: "utf-8",
    },
  ],
];

const loadCSVItems = (event) => {
  emit("loadCSVItems", event);
};

const getNameFromCSV = () => {
  let d = new Date();
  return "export-" + d.toISOString() + ".csv";
};
</script>

<style scoped lang="scss">
.c-csv-download {
  .c-icon {
    margin-right: 16px;
  }

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .disabled {
    color: $neutral;
    cursor: not-allowed;

    svg path {
      fill: $neutral;
    }
  }
}

.c-button--secondary {
  margin-right: 16px;
}
</style>
