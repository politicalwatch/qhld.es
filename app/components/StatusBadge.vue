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

// The badge owns this request; the speech-search history reads the same answer.
const { data: status } = await useDataFreshness();

// A null status (no answer yet) classifies as "down", which is the honest thing to
// show before we have heard anything.
const state = computed(() =>
  classifyDataStatus({
    ok: status.value?.status === "ok",
    lastUpdated: status.value?.last_updated,
  })
);

const label = computed(() => LABELS[state.value]);

// Only meaningful when the backend answered; "down" has no date to show.
const timestamp = computed(() =>
  state.value === "down" ? "" : formatDateTime(status.value?.last_updated)
);

// Which dataset is behind is what you want next once the badge is not green.
const breakdown = computed(() => {
  const datasets = status.value?.datasets ?? {};
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
