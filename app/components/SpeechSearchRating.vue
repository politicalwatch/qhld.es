<template>
  <section class="c-speech-search__rating" aria-labelledby="speech-rating-title">
    <template v-if="submitted">
      <p id="speech-rating-title" class="c-speech-search__rating-thanks">
        <span class="c-speech-search__rating-tick" aria-hidden="true">
          <Icon name="mdi:check" />
        </span>
        Gracias, tu valoración nos ayuda a mejorar el buscador
      </p>
      <UInputRating
        :model-value="submitted"
        readonly
        size="xl"
        icon="mdi:star"
        empty-icon="mdi:star-outline"
        :ui="{ item: 'c-speech-search__star' }"
        aria-label="Tu valoración"
      />
    </template>

    <template v-else>
      <p id="speech-rating-title" class="c-speech-search__rating-question">
        ¿Te han servido estos resultados?
      </p>

      <UInputRating
        v-model="rating"
        size="xl"
        icon="mdi:star"
        empty-icon="mdi:star-outline"
        :ui="{ item: 'c-speech-search__star' }"
        aria-label="Valora estos resultados de 1 a 5"
      />

      <!-- Only asked on a low score: a happy user shouldn't be handed a form, and an
           unhappy one telling us *what* broke is the whole point of collecting this.
           Revealed rather than swapped in, so the panel doesn't jump under the cursor. -->
      <Transition name="rating-reveal">
        <div v-if="low" class="c-speech-search__rating-detail">
          <p class="c-speech-search__rating-label">¿Qué ha fallado?</p>
          <ul class="c-speech-search__rating-reasons">
            <li v-for="reason in RATING_REASONS" :key="reason.slug">
              <button
                type="button"
                class="c-speech-search__rating-reason"
                :class="{
                  'c-speech-search__rating-reason--on': reasons.includes(reason.slug),
                }"
                :aria-pressed="reasons.includes(reason.slug)"
                @click="toggle(reason.slug)"
              >
                <Icon
                  v-if="reasons.includes(reason.slug)"
                  name="mdi:check"
                  class="c-speech-search__rating-reason-tick"
                  aria-hidden="true"
                />
                {{ reason.label }}
              </button>
            </li>
          </ul>

          <textarea
            v-model="comment"
            class="c-speech-search__rating-comment"
            rows="3"
            :maxlength="COMMENT_MAX_LENGTH"
            placeholder="Cuéntanos algo más (opcional)"
          />
          <p class="c-speech-search__rating-hint">
            Máx. {{ COMMENT_MAX_LENGTH }} caracteres · No incluyas datos personales
          </p>
        </div>
      </Transition>

      <Transition name="rating-reveal">
        <button
          v-if="rating"
          type="button"
          class="c-speech-search__rating-submit"
          :disabled="sending"
          @click="submit"
        >
          <Icon
            v-if="sending"
            name="mdi:loading"
            class="c-speech-search__spin"
            aria-hidden="true"
          />
          {{ sending ? "Enviando…" : "Enviar valoración" }}
        </button>
      </Transition>
    </template>
  </section>
</template>

<script setup>
import {
  COMMENT_MAX_LENGTH,
  RATING_REASONS,
  buildRatingPayload,
  isLowRating,
  isSubmittable,
} from "#shared/utils/searchRating";

const props = defineProps({
  query: { type: String, required: true },
  queryMeta: { type: Object, default: () => ({}) },
  results: { type: Array, default: () => [] },
  corpus: { type: String, default: null },
  // The answer already given for this search, restored from the store when a past
  // search is recalled — so we show it back instead of asking again.
  rated: { type: Number, default: null },
  sending: { type: Boolean, default: false },
});

const emit = defineEmits(["submit"]);

const rating = ref(null);
const reasons = ref([]);
const comment = ref("");

const low = computed(() => isLowRating(rating.value));

// Straight off the store via the parent: it persists the answer, so the thanks state
// covers both "just rated" and "rated this search earlier" without a second copy here.
const submitted = computed(() => props.rated ?? null);

// The parent keeps this component mounted across searches (the results wrapper stays),
// so a new query has to clear the half-filled form of the previous one.
watch(
  () => props.query,
  () => {
    rating.value = null;
    reasons.value = [];
    comment.value = "";
  }
);

const toggle = (slug) => {
  reasons.value = reasons.value.includes(slug)
    ? reasons.value.filter((item) => item !== slug)
    : [...reasons.value, slug];
};

const submit = () => {
  if (!isSubmittable({ rating: rating.value }) || props.sending) return;
  emit(
    "submit",
    buildRatingPayload({
      rating: rating.value,
      reasons: reasons.value,
      comment: comment.value,
      query: props.query,
      queryMeta: props.queryMeta,
      results: props.results,
      corpus: props.corpus,
    })
  );
};
</script>
