<template>
  <section class="c-debate">
    <header class="c-debate__top">
      <span class="c-debate__num">Punto {{ number }}</span>
      <span v-if="debate.references.length > 1" class="c-debate__type">
        Debate conjunto
      </span>
      <span
        v-else-if="initiativeFor(debate.references[0])?.type"
        class="c-debate__type"
      >
        {{ initiativeFor(debate.references[0]).type }} ·
        <NuxtLink
          :to="`/iniciativas/${debate.references[0].replace('/', '-')}`"
          class="c-debate__ref"
        >
          {{ debate.references[0] }}
        </NuxtLink>
      </span>
    </header>

    <div
      v-for="reference in debate.references"
      :key="reference"
      class="c-debate__initiative"
    >
      <p
        v-if="debate.references.length > 1 && initiativeFor(reference)?.type"
        class="c-debate__type c-debate__type--sub"
      >
        {{ initiativeFor(reference).type }} ·
        <NuxtLink
          :to="`/iniciativas/${reference.replace('/', '-')}`"
          class="c-debate__ref"
        >
          {{ reference }}
        </NuxtLink>
      </p>
      <h3 class="c-debate__title">
        <NuxtLink :to="`/iniciativas/${reference.replace('/', '-')}`">
          {{ initiativeFor(reference)?.title ?? `Iniciativa ${reference}` }}
        </NuxtLink>
      </h3>
    </div>

    <p class="c-debate__meta">
      {{ debate.speeches.length }}
      {{ debate.speeches.length === 1 ? "intervención" : "intervenciones" }}
    </p>

    <ul class="c-debate__talks">
      <li
        v-for="speech in debate.speeches"
        :key="speech.id"
        class="c-debate__talk"
        :style="{ '--grp': colorFor(speech) }"
      >
        <NuxtLink
          :to="`/intervenciones/${speech.video_id ?? speech.id}`"
          class="c-debate__talk-link"
        >
          <span class="c-debate__nm">{{ speech.speaker }}</span>
          <span class="c-debate__rl">
            <template v-if="speech.group">{{ speech.group }} · </template>{{ speech.role }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
const { debate, initiativesByRef, number } = defineProps({
  // { references: [...], speeches: [...] } — speeches already sorted by order
  debate: { type: Object, required: true },
  // reference code → { id, title, type }
  initiativesByRef: { type: Object, default: () => ({}) },
  // agenda position ("Punto N")
  number: { type: Number, required: true },
});

const initiativeFor = (reference) => initiativesByRef[reference];

// group-coded timeline node: colour from the speaker's matched deputy party
// (mint fallback for ministers/guests who don't match a deputy)
const getDeputyByName = useDeputyByName();
const colorFor = (speech) =>
  partyColor(getDeputyByName(speech.speaker)?.party_name);
</script>

<style lang="scss" scoped>
.c-debate {
  margin-bottom: rem(34px);

  &__top {
    display: flex;
    align-items: baseline;
    gap: rem(14px);
    margin-bottom: rem(12px);
  }

  &__num {
    flex: none;
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(13px);
    color: $white;
    background-color: var(--color-brand-700);
    padding: rem(3px) rem(9px);
  }

  &__type {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(11px);
    color: $secondary-medium;

    &--sub {
      display: block;
      margin: 0 0 rem(2px);
    }
  }

  &__ref {
    color: var(--color-brand-800);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__initiative {
    margin-bottom: rem(4px);
  }

  &__title {
    font-family: $font-headline;
    font-weight: 400;
    font-size: rem(22px);
    line-height: 1.22;
    text-transform: none;
    color: $black;
    margin: 0 0 rem(4px);

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        text-underline-offset: 2px;
      }
    }
  }

  &__meta {
    font-size: rem(12px);
    line-height: 1.4;
    color: $secondary-medium;
    margin: 0 0 rem(14px);
  }

  // timeline: a vertical rail with a group-coloured node dot per speaker
  &__talks {
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;

    &::before {
      content: "";
      position: absolute;
      left: 6px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      transform: translateX(-50%);
      background-color: $neutral;
    }
  }

  &__talk {
    position: relative;
    margin: 0;
    padding-left: rem(18px);

    // suppress the global li::before counter from 04_base/_base__lists.scss
    // (incl. its margin-left, which would push the dot off the rail),
    // then draw the timeline node dot centred on the rail (both at x=6px)
    &::before {
      content: "";
      position: absolute;
      left: 6px;
      top: 50%;
      margin: 0;
      transform: translate(-50%, -50%);
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background-color: var(--grp, var(--color-brand-500));
      border: 2px solid $white;
    }
  }

  &__talk-link {
    display: flex;
    flex-direction: column;
    padding: rem(10px) rem(10px);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--color-brand-50);
    }
  }

  &__nm {
    font-family: $font-headline;
    font-size: rem(16px);
    line-height: 1.15;
    color: $black;
  }

  &__rl {
    font-size: rem(12.5px);
    line-height: 1.3;
    color: $secondary-medium;
    margin-top: rem(4px);
  }
}
</style>
