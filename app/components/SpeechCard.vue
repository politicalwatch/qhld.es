<template>
  <article
    class="c-speech-card"
    :id="`speech-card-${speech.id}`"
    :style="{ '--group-color': groupColor }"
  >
    <header class="c-speech-card__who">
      <span class="c-speech-card__avatar-ring">
        <UAvatar
          :src="deputy?.image"
          :alt="speech.speaker"
          :text="initials"
          class="c-speech-card__avatar"
        />
      </span>
      <div class="c-speech-card__identity">
        <!-- always rendered (min-height) so the name aligns across cards with
             and without a group -->
        <span class="c-speech-card__group">
          <template v-if="speech.group">
            <i class="c-speech-card__group-dot" aria-hidden="true" />{{ speech.group }}
          </template>
        </span>
        <h2 class="c-speech-card__name">
          <NuxtLink :to="speechUrl">{{ speech.speaker }}</NuxtLink>
        </h2>
        <p v-if="speech.role" class="c-speech-card__role">{{ speech.role }}</p>
      </div>
    </header>

    <div class="c-speech-card__psg">
      <UCarousel
        v-if="highlights.length > 1"
        v-slot="{ item }"
        :items="highlights"
        dots
        :ui="{
          dots: 'static mt-3 flex flex-wrap items-center justify-center gap-1.5',
          dot: 'cursor-pointer size-1.5 rounded-full bg-brand-200 transition data-[state=active]:bg-brand-700',
        }"
      >
        <p class="c-speech-card__slide">{{ item }}</p>
      </UCarousel>
      <p v-else-if="highlights.length === 1" class="c-speech-card__slide">
        {{ highlights[0] }}
      </p>
    </div>

    <footer class="c-speech-card__foot">
      <NuxtLink
        v-if="sessionCode"
        :to="`/sesiones/${sessionCode}`"
        class="c-speech-card__sess c-speech-card__sess--link"
      >
        <b>{{ formattedDate }}</b>{{ sessionLabel }}
      </NuxtLink>
      <span v-else class="c-speech-card__sess">
        <b>{{ formattedDate }}</b>{{ sessionLabel }}
      </span>
      <NuxtLink :to="speechUrl" class="c-speech-card__go">Ver intervención →</NuxtLink>
    </footer>
  </article>
</template>

<script setup>
import config from "@/config";

const { speech, highlights } = defineProps({
  speech: { type: Object, required: true },
  highlights: { type: Array, default: () => [] },
});

// Match the speaker to a deputy (exact name) to borrow their photo + party
// colour — same lookup the session page uses. Ministers/guests won't match:
// they fall back to initials on a mint avatar. Calling the finder here also
// triggers the (deduplicated) deputies fetch.
const getDeputyByName = useDeputyByName();
const deputy = computed(() => getDeputyByName(speech.speaker));

const groupColor = computed(
  () =>
    (deputy.value?.party_name &&
      config.STYLES.parties[deputy.value.party_name]?.color) ||
    "#a3d5c8"
);

// "Apellido1 Apellido2, Nombre" → "PA" (given-name initial + first surname).
const initials = computed(() => {
  const [surnames = "", given = ""] = speech.speaker.split(",");
  const first = given.trim()[0] ?? "";
  const last = surnames.trim()[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
});

const speechUrl = computed(
  () => `/intervenciones/${speech.video_id ?? speech.id}`
);

// date arrives as a yyyymmdd integer, e.g. 20241009
const formattedDate = computed(() => formatDateInt(speech.date));

// session_link is the Diario PDF path; its filename stem is the session code
// (e.g. /public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-196.PDF → DSCD-15-PL-196)
const sessionCode = computed(() => {
  const stem = speech.session_link?.split("/").pop()?.replace(/\.pdf$/i, "");
  return stem || null;
});

// The code's trailing segment is the sitting number → "Pleno núm. 196".
const sessionLabel = computed(() => {
  const n = sessionCode.value?.split("-").pop();
  return n && /^\d+$/.test(n)
    ? `${speech.session_name} núm. ${n}`
    : speech.session_name;
});
</script>

<style scoped lang="scss">
.c-speech-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: $white;
  border: 1px solid $neutral;
  border-top: 4px solid var(--group-color);
  padding: rem(18px);
  transition: transform 0.16s, box-shadow 0.16s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px -22px rgba(45, 66, 82, 0.5);
  }

  // header: avatar vertically centred with the group / name / role column
  &__who {
    display: flex;
    align-items: center;
    gap: rem(12px);
    margin-bottom: rem(16px);
  }

  // Group-colour border hugging the round photo (mirrors DeputyCard).
  &__avatar-ring {
    flex: none;
    line-height: 0;
    border-radius: 50%;
    border: 2.5px solid var(--group-color);
  }

  &__avatar {
    width: rem(52px) !important;
    height: rem(52px) !important;
    font-family: $font-headline;
    font-size: rem(18px);
    background-color: var(--color-brand-50);
    color: $secondary-dark;
  }

  &__identity {
    min-width: 0;
  }

  &__group {
    display: flex;
    align-items: center;
    gap: rem(7px);
    // reserve one line even when empty so the name aligns across cards
    min-height: rem(16px);
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: rem(11px);
    color: $secondary-dark;
    margin: 0 0 rem(5px);
  }

  &__group-dot {
    width: 10px;
    height: 10px;
    flex: none;
    display: inline-block;
    background-color: var(--group-color);
  }

  &__name {
    font-family: $font-headline;
    font-weight: 400;
    font-size: rem(19px);
    line-height: 1.12;
    text-transform: none;
    color: $black;
    margin: 0;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        text-underline-offset: 2px;
      }
    }
  }

  &__role {
    font-size: rem(12.5px);
    line-height: 1.4;
    color: $secondary-medium;
    margin: rem(3px) 0 0;
  }

  // passage carousel — fixed-height slide area so the pager never jumps
  &__psg {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__slide {
    min-height: 9.8em;
    font-size: rem(14.5px);
    line-height: 1.62;
    color: $secondary-dark;
    margin: 0;
    border-left: 3px solid var(--color-brand-400);
    padding-left: rem(12px);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 6;
    overflow: hidden;
  }

  // footer: date (bold) over session name on the left, "Ver intervención" right
  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(8px);
    margin-top: rem(16px);
    padding-top: rem(12px);
    border-top: 1px solid $neutral;
  }

  &__sess {
    font-size: rem(11.5px);
    line-height: 1.3;
    font-weight: 400;
    color: $secondary-medium;
    text-decoration: none;

    b {
      display: block;
      font-weight: 500;
      color: $secondary-dark;
      font-variant-numeric: tabular-nums;
    }

    &--link:hover b {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__go {
    font-family: $font-headline;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: rem(11px);
    color: var(--color-brand-700);
    white-space: nowrap;
    text-decoration: none;

    &:hover {
      color: var(--color-brand-800);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
}
</style>
