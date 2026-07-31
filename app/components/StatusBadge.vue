<template>
  <div class="c-status-badge" role="status" :title="breakdown">
    <span :class="`c-status-badge__dot c-status-badge__dot--${state}`" />
    <span class="c-status-badge__label">
      {{ label }}
      <span v-if="timestamp" class="c-status-badge__timestamp">
        · {{ timestamp }}
      </span>
    </span>
  </div>
</template>

<script setup>
import { classifyDataStatus } from "@/utils/status";
import { formatDateTime } from "@/utils/dates";

const LABELS = {
  ok: "Datos actualizados",
  delayed: "Datos pendientes de actualización",
  stale: "Datos desactualizados",
  down: "Servicio no disponible",
};

// Served by server/api/status.js, which caches the backend answer for a minute
// so the footer does not ask once per page view.
const { data } = await useFetch("/api/status", {
  default: () => ({ ok: false, lastUpdated: null, datasets: {} }),
});

const state = computed(() =>
  classifyDataStatus({
    ok: data.value?.ok,
    lastUpdated: data.value?.lastUpdated,
  })
);

const label = computed(() => LABELS[state.value]);

// Only meaningful when the backend answered; "down" has no date to show.
const timestamp = computed(() =>
  state.value === "down" ? "" : formatDateTime(data.value?.lastUpdated)
);

// Which dataset is behind is what you want next once the badge is not green.
const breakdown = computed(() => {
  const datasets = data.value?.datasets ?? {};
  const lines = Object.entries(datasets).map(
    ([name, updatedAt]) => `${name}: ${formatDateTime(updatedAt)}`
  );
  return lines.length ? lines.join("\n") : label.value;
});
</script>

<style scoped lang="scss">
.c-status-badge {
  display: inline-flex;
  align-items: baseline;
  gap: rem(8px);
  padding: rem(6px) rem(12px);
  background-color: rgba($white, 0.08);
  border-radius: rem(4px);
  text-align: left;

  &__dot {
    flex-shrink: 0;
    width: rem(10px);
    height: rem(10px);
    border-radius: 50%;

    // Nudged off the baseline so the dot centres on the text, not under it.
    transform: translateY(rem(-1px));

    &--ok {
      background-color: $completed;
    }

    &--delayed {
      background-color: $yellow;
    }

    &--stale {
      background-color: $warning;
    }

    &--down {
      background-color: $error;
    }
  }

  &__label {
    @include overline;

    color: $white;
  }

  // The long "pendientes de actualización" label needs somewhere to break on
  // narrow screens; the timestamp is the natural place.
  &__timestamp {
    white-space: nowrap;
  }
}
</style>
