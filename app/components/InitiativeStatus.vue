<template>
  <div class="c-initiative-status">
    <div
      :class="`c-initiative-status__icon c-initiative-status__icon--${getColorByStatus(
        initiative.status
      )}`"
    >
      <Icon :icon="getIcon(initiative)" color="#ffffff" />
    </div>
    <div class="c-initiative-status__message">
      {{ getStateMessage(initiative) }}
    </div>
  </div>
  <div v-if="showLastUpdate()" class="c-initiative-status">
    <div class="c-initiative-status__message c-initiative-status__subtitle">
      {{ getLastUpdate(initiative) }}
    </div>
  </div>
</template>

<script setup>
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import es from "date-fns/locale/es";
import { Icon } from "@iconify/vue";

const { initiative, hasLastUpdate, mappedStatus } = defineProps({
  initiative: { type: Object, required: true },
  hasLastUpdate: { type: Boolean, default: true },
  mappedStatus: {
    type: Object,
    default: () => ({
      completed: [
        "Aprobada",
        "Respondida",
        "Celebrada",
        "Convalidada",
        "Convertida en otra",
        "Acumulada en otra",
      ],
      neutral: ["En tramitación", "Desconocida"],
      error: [
        "No admitida a trámite",
        "No debatida",
        "Caducada",
        "Rechazada",
        "Retirada",
        "Derogada",
        "No celebrada",
      ],
    }),
  },
});

const getColorByStatus = (status) => {
  for (let color in mappedStatus) {
    if (mappedStatus[color].indexOf(status) != -1) return color;
  }
  return "neutral";
};

const hasNeutralStatus = () => {
  return mappedStatus.neutral.includes(initiative.status);
}

const datesDiffer = () => {
  return initiative.created != initiative.updated;
}

const showLastUpdate = () => {
  return hasLastUpdate && hasNeutralStatus() && datesDiffer();
}

const getIcon = (initiative) => {
  const color = getColorByStatus(initiative["status"]);
  const map = {
    completed: "mdi:check-bold",
    neutral: "mdi:clock-outline",
    error: "mdi:times",
  };
  return map[color];
};

const getStateMessage = (initiative) => {
  if (initiative["status"] == "Desconocida") {
    return `${initiative["status"]}`;
  }

  const color = getColorByStatus(initiative["status"]);
  let date = initiative["updated"];
  if (color == "neutral") {
    date = initiative["created"];
  }

  const formattedDate = formatDate(date);

  return `${initiative["status"]} ${formattedDate}`;
};

const formatDate = (date) => {
  return formatDistanceToNow(new Date(date), {
    locale: es,
    addSuffix: true,
  }).replace("alrededor de ", "");
};

const getLastUpdate = (initiative) => {
  const formattedDate = formatDate(initiative.updated);

  return `Última actualización ${formattedDate}`;
}
</script>

<style lang="scss" scoped>
.c-initiative-status {
  display: flex;
  align-items: center;
  margin-bottom: rem(5px);

  &__icon {
    margin-right: 8px;
    width: rem(24px);
    height: rem(24px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    svg {
      width: rem(10px);
      height: rem(10px);
    }

    &--neutral {
      background-color: $secondary;
      border-color: $secondary;
    }

    &--completed {
      background-color: $completed;
      border-color: $completed;
    }

    &--error {
      background-color: $error;
      border-color: $error;
    }
  }

  &__message {
    @include overline;
  }

  &__subtitle {
    text-transform: none;
    margin-left: 2rem;
    color: $secondary;
  }
}
</style>
