<template>
  <div
    ref="wrapEl"
    class="c-vplayer"
    :class="{ 'c-vplayer--fs': isFullscreen }"
    @keydown="onKeydown"
  >
    <div class="c-vplayer__stage">
      <!-- No `crossorigin` here: it would put the video request itself into CORS mode,
           and the Congress CDN sends no allow-origin header. That is also why the
           subtitle track is served from our own origin. -->
      <video
        ref="videoEl"
        class="c-vplayer__video"
        :src="src"
        preload="metadata"
        playsinline
        @loadedmetadata="onLoadedMetadata"
        @durationchange="readDuration"
        @timeupdate="onTimeUpdate"
        @progress="readBuffered"
        @play="playing = true"
        @pause="playing = false"
        @ended="playing = false"
        @volumechange="readVolume"
        @click="togglePlay"
      >
        <track
          v-for="track in tracks"
          :key="track.lang"
          :default="track.lang === captionLang"
          kind="subtitles"
          :src="track.src"
          :srclang="track.lang"
          :label="track.label"
        >
      </video>

      <button
        v-show="!playing"
        type="button"
        class="c-vplayer__big"
        aria-label="Reproducir"
        @click="togglePlay"
      >
        <Icon name="mdi:play" :size="30" />
      </button>
    </div>

    <div class="c-vplayer__bar">
      <!-- The scrub bar carries the match markers, so it gets a row of its own: at any
           width the ticks stay far enough apart to be aimed at. -->
      <div
        ref="scrubEl"
        class="c-vplayer__scrub"
        role="slider"
        tabindex="0"
        aria-label="Progreso del vídeo"
        :aria-disabled="!ready"
        :aria-valuemin="0"
        :aria-valuemax="ready ? Math.round(duration) : 0"
        :aria-valuenow="Math.round(displayTime)"
        :aria-valuetext="`${formatClock(displayTime)} de ${formatClock(duration)}`"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @keydown="onScrubKeydown"
      >
        <div class="c-vplayer__rail">
          <div class="c-vplayer__buffered" :style="{ width: pct(buffered) }" />
          <div class="c-vplayer__played" :style="{ width: pct(displayTime) }" />
          <!-- Decorative: the accessible way to reach a match is the highlights panel,
               which lists every one of them as a button. A tick inside a slider would
               be a control nested in a control. Pointer clicks still snap to it. -->
          <span
            v-for="marker in visibleMarkers"
            :key="marker.id"
            class="c-vplayer__marker"
            :class="{ 'c-vplayer__marker--on': marker.id === activeMarkerId }"
            :style="{ left: pct(marker.time) }"
            :title="marker.label"
            aria-hidden="true"
          />
          <span class="c-vplayer__handle" :style="{ left: pct(displayTime) }" />
        </div>
      </div>

      <div class="c-vplayer__btns">
        <button
          type="button"
          class="c-vplayer__btn"
          :aria-label="playing ? 'Pausar' : 'Reproducir'"
          @click="togglePlay"
        >
          <Icon :name="playing ? 'mdi:pause' : 'mdi:play'" :size="20" />
        </button>

        <span class="c-vplayer__time">
          {{ formatClock(displayTime) }} / {{ formatClock(duration) }}
        </span>

        <span class="c-vplayer__spacer" />

        <div class="c-vplayer__vol">
          <button
            type="button"
            class="c-vplayer__btn"
            :aria-label="muted ? 'Activar sonido' : 'Silenciar'"
            @click="toggleMute"
          >
            <Icon
              :name="muted || !volume ? 'mdi:volume-off' : 'mdi:volume-high'"
              :size="20"
            />
          </button>
          <input
            class="c-vplayer__vol-range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="muted ? 0 : volume"
            aria-label="Volumen"
            @input="setVolume(Number($event.target.value))"
          >
        </div>

        <!-- The browser's own caption menu goes away with its controls, so a speech
             with two tracks needs ours to reach the second one. -->
        <div v-if="tracks.length" ref="ccEl" class="c-vplayer__cc">
          <button
            type="button"
            class="c-vplayer__btn"
            :class="{ 'c-vplayer__btn--on': captionLang }"
            aria-label="Subtítulos"
            aria-haspopup="true"
            :aria-expanded="ccOpen"
            @click="ccOpen = !ccOpen"
          >
            <Icon name="mdi:closed-caption-outline" :size="20" />
          </button>
          <ul v-if="ccOpen" class="c-vplayer__menu">
            <li v-for="option in ccOptions" :key="option.lang ?? 'off'">
              <button
                type="button"
                class="c-vplayer__opt"
                :class="{ 'c-vplayer__opt--on': option.lang === captionLang }"
                @click="chooseCaptions(option.lang)"
              >
                <Icon
                  name="mdi:check"
                  :size="14"
                  :class="[
                    'c-vplayer__opt-tick',
                    { 'c-vplayer__opt-tick--off': option.lang !== captionLang },
                  ]"
                />
                {{ option.label }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Whether fullscreen exists at all is a property of the browser, which the
             server cannot know — rendering it there would be a hydration mismatch. -->
        <ClientOnly>
          <button
            v-if="canFullscreen"
            type="button"
            class="c-vplayer__btn"
            :aria-label="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
            @click="toggleFullscreen"
          >
            <Icon
              :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
              :size="20"
            />
          </button>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
// The intervention player.
//
// Custom controls rather than the browser's, for one reason: the scrub bar has to show
// where in the video the reader's search matches were said, and nothing can be drawn on
// the native one. Everything else here is the cost of that — play/pause, seeking,
// volume, a captions menu and fullscreen all have to be provided again.
//
// Two deliberate choices worth keeping:
//
// - **The bar sits below the video, not over it.** The browser paints caption cues at
//   the bottom of the video box; an overlaid bar would cover them, and would need
//   auto-hide logic that touch devices handle badly.
// - **Cue rendering stays native.** Only the *menu* is ours: tracks are switched by
//   setting `mode`, so the reader's own caption settings (size, colour) and captions in
//   fullscreen keep working, exactly as they did with the native controls.

const { src, tracks, markers, activeMarkerId } = defineProps({
  src: { type: String, required: true },
  // [{ lang, label, src }] — one per timed language block
  tracks: { type: Array, default: () => [] },
  // where search matches were said: [{ id, time, label }]
  markers: { type: Array, default: () => [] },
  // the match the highlights panel is currently on, lit up on the bar
  activeMarkerId: { type: Number, default: null },
});

// null = captions off. The page keeps this in step with the transcript's language tab.
const captionLang = defineModel("captionLang", { type: String, default: null });

const wrapEl = useTemplateRef("wrapEl");
const videoEl = useTemplateRef("videoEl");
const scrubEl = useTemplateRef("scrubEl");
const ccEl = useTemplateRef("ccEl");

const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const buffered = ref(0);
const volume = ref(1);
const muted = ref(false);
const ccOpen = ref(false);

// Nothing can be seeked until the browser knows how long the clip is — with
// `preload="metadata"` that is a moment after mount, and for a clip the Congress
// serves slowly it can be longer.
const ready = computed(() => Number.isFinite(duration.value) && duration.value > 0);

// ── playback ──────────────────────────────────────────────────────────────
const togglePlay = () => {
  const video = videoEl.value;
  if (!video) return;
  if (video.paused) video.play().catch(() => {});
  else video.pause();
};

const readDuration = () => {
  duration.value = videoEl.value?.duration ?? 0;
};

// A seek asked for before the metadata arrived cannot be applied yet — the browser
// silently ignores currentTime on a video whose duration it does not know. Hold it and
// replay it, or a click on a match right after the page loads would do nothing.
let pendingSeek = null;

const onLoadedMetadata = () => {
  readDuration();
  readVolume();
  if (pendingSeek) {
    const { time, play } = pendingSeek;
    pendingSeek = null;
    seek(time, { play });
  }
};

const onTimeUpdate = () => {
  // While dragging, the bar shows where the pointer is, not where playback is.
  if (dragging.value) return;
  currentTime.value = videoEl.value?.currentTime ?? 0;
};

const readBuffered = () => {
  const video = videoEl.value;
  if (!video?.buffered?.length) return;
  // The run that holds the playhead: after a seek the earlier runs are behind us and
  // painting up to the last one would claim buffering that is not there.
  for (let i = 0; i < video.buffered.length; i++) {
    if (
      video.buffered.start(i) <= video.currentTime &&
      video.buffered.end(i) >= video.currentTime
    ) {
      buffered.value = video.buffered.end(i);
      return;
    }
  }
  buffered.value = 0;
};

// What the page calls when the reader clicks a match.
const seek = (time, { play = false } = {}) => {
  const video = videoEl.value;
  if (!video || !Number.isFinite(time)) return;
  if (!ready.value) {
    pendingSeek = { time, play };
    return;
  }
  video.currentTime = Math.min(Math.max(time, 0), duration.value);
  currentTime.value = video.currentTime;
  if (play) video.play().catch(() => {});
};

defineExpose({ seek });

// ── scrub bar ─────────────────────────────────────────────────────────────
const dragging = ref(false);
const dragTime = ref(0);
const displayTime = computed(() => (dragging.value ? dragTime.value : currentTime.value));

const pct = (seconds) =>
  ready.value ? `${Math.min(Math.max(seconds / duration.value, 0), 1) * 100}%` : "0%";

const visibleMarkers = computed(() =>
  ready.value ? markers.filter((marker) => marker.time <= duration.value) : []
);

// How near a tick a click has to land to mean it. A match's cue start is the useful
// place to arrive, and hitting a 3px tick exactly is not something a pointer does.
const SNAP_PX = 8;

const timeFromPointer = (event) => {
  const rail = scrubEl.value?.getBoundingClientRect();
  if (!rail?.width) return 0;
  const x = Math.min(Math.max(event.clientX - rail.left, 0), rail.width);
  const nearest = visibleMarkers.value.find(
    (marker) =>
      Math.abs((marker.time / duration.value) * rail.width - x) <= SNAP_PX
  );
  return nearest ? nearest.time : (x / rail.width) * duration.value;
};

// Seeking on every pointermove would re-request the clip from the Congress CDN dozens
// of times a drag, so the bar tracks the pointer and the seek happens on release.
const onPointerDown = (event) => {
  if (!ready.value) return;
  dragging.value = true;
  dragTime.value = timeFromPointer(event);
  scrubEl.value?.setPointerCapture?.(event.pointerId);
};

const onPointerMove = (event) => {
  if (!dragging.value) return;
  dragTime.value = timeFromPointer(event);
};

const onPointerUp = (event) => {
  if (!dragging.value) return;
  const time = timeFromPointer(event);
  dragging.value = false;
  scrubEl.value?.releasePointerCapture?.(event.pointerId);
  seek(time, { play: playing.value });
};

const STEP = 5;
const BIG_STEP = 30;

const onScrubKeydown = (event) => {
  if (!ready.value) return;
  // Stepped from the element rather than our own copy of the time: `currentTime` here
  // only catches up on the next `timeupdate`, and an arrow press right after something
  // else moved the video would step from where it used to be.
  const from = videoEl.value?.currentTime ?? currentTime.value;
  const by = {
    ArrowLeft: -STEP,
    ArrowRight: STEP,
    ArrowDown: -STEP,
    ArrowUp: STEP,
    PageDown: -BIG_STEP,
    PageUp: BIG_STEP,
  }[event.key];
  let time = null;
  if (by !== undefined) time = from + by;
  else if (event.key === "Home") time = 0;
  else if (event.key === "End") time = duration.value;
  if (time === null) return;
  event.preventDefault();
  // The bar owns its arrows; without this the container's shortcuts fire too.
  event.stopPropagation();
  seek(time, { play: playing.value });
};

// ── sound ─────────────────────────────────────────────────────────────────
const readVolume = () => {
  const video = videoEl.value;
  if (!video) return;
  volume.value = video.volume;
  muted.value = video.muted;
};

const toggleMute = () => {
  const video = videoEl.value;
  if (!video) return;
  video.muted = !video.muted;
};

const setVolume = (value) => {
  const video = videoEl.value;
  if (!video) return;
  video.volume = value;
  // Dragging the slider up is how a muted player is expected to come back.
  video.muted = value === 0;
};

// ── captions ──────────────────────────────────────────────────────────────
const ccOptions = computed(() => [
  { lang: null, label: "Desactivados" },
  ...tracks.map((track) => ({ lang: track.lang, label: track.label })),
]);

const chooseCaptions = (lang) => {
  captionLang.value = lang;
  ccOpen.value = false;
};

onClickOutside(ccEl, () => {
  ccOpen.value = false;
});

// `default` on a <track> only decides the first render and is inert afterwards, so the
// live TextTrack list is what has to be set — on a language change, and on mount, when
// the tracks may not have existed yet during SSR.
watch(
  [captionLang, () => tracks.map((track) => track.lang).join(",")],
  async () => {
    await nextTick();
    const textTracks = videoEl.value?.textTracks;
    if (!textTracks?.length) return;
    for (const textTrack of textTracks) {
      textTrack.mode =
        textTrack.language === captionLang.value ? "showing" : "disabled";
    }
  },
  { immediate: true }
);

// ── fullscreen ────────────────────────────────────────────────────────────
// On the wrapper rather than the video, so our controls come with it.
const { isFullscreen, toggle: toggleWrapFullscreen, isSupported } = useFullscreen(wrapEl);

// iPhone Safari has no element fullscreen at all; the video element has its own, which
// takes over with the native UI (and its own caption menu). Better than no button.
const canFullscreen = computed(
  () => isSupported.value || !!videoEl.value?.webkitEnterFullscreen
);

const toggleFullscreen = () => {
  if (isSupported.value) toggleWrapFullscreen();
  else videoEl.value?.webkitEnterFullscreen?.();
};

// ── keyboard ──────────────────────────────────────────────────────────────
// The usual player shortcuts, while focus is anywhere inside the player. Space and the
// arrows belong to whatever control holds focus, so they are left alone there.
const onKeydown = (event) => {
  // The scrub bar is not in this list on purpose: it answers to the arrows, and space
  // on a focused progress bar is expected to play, as it does in every other player.
  const onControl = event.target?.closest?.("button, input");
  const key = event.key.toLowerCase();
  if (key === " " || key === "spacebar" || key === "k") {
    if (onControl && key !== "k") return;
    event.preventDefault();
    togglePlay();
  } else if (key === "m") {
    toggleMute();
  } else if (key === "f") {
    if (canFullscreen.value) toggleFullscreen();
  } else if (key === "escape") {
    ccOpen.value = false;
  }
};

onMounted(() => {
  // Autoplay is not in play here, but a browser restoring a page can leave the element
  // already playing or already positioned — read the truth rather than assume it.
  readDuration();
  readVolume();
  playing.value = !!videoEl.value && !videoEl.value.paused;
  currentTime.value = videoEl.value?.currentTime ?? 0;
});
</script>

<style lang="scss" scoped>
.c-vplayer {
  background-color: $black;

  &--fs {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  &__stage {
    position: relative;
    line-height: 0;
  }

  &__video {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: rem(420px);
    background-color: $black;

    .c-vplayer--fs & {
      max-height: none;
      height: auto;
      max-width: 100%;
      margin: 0 auto;
    }
  }

  // Centre play badge: the only affordance on the picture itself, since the bar below
  // carries everything else.
  &__big {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(58px);
    height: rem(58px);
    padding-left: rem(4px);
    border: 2px solid rgba($white, 0.9);
    border-radius: 50%;
    background-color: rgba($black, 0.45);
    color: $white;
    cursor: pointer;

    &:hover {
      background-color: rgba($black, 0.7);
    }
  }

  &__bar {
    padding: rem(8px) rem(10px) rem(10px);
    background-color: $black;
    color: $white;
  }

  // ── scrub ───────────────────────────────────────────────────────────────
  &__scrub {
    position: relative;
    padding: rem(7px) 0;
    cursor: pointer;
    touch-action: none; // the drag is ours, not the page's

    &:focus-visible {
      outline: 2px solid #efca53;
      outline-offset: 2px;
    }

    &[aria-disabled="true"] {
      cursor: default;
      opacity: 0.5;
    }
  }

  &__rail {
    position: relative;
    height: rem(5px);
    background-color: rgba($white, 0.25);
  }

  &__buffered,
  &__played {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }

  &__buffered {
    background-color: rgba($white, 0.3);
  }

  &__played {
    background-color: var(--color-brand-500);
  }

  // A match, at the second it was said. Yellow is what the transcript uses to ring the
  // match being read, so the bar and the text say the same thing.
  &__marker {
    position: absolute;
    top: rem(-4px);
    width: rem(3px);
    height: rem(13px);
    margin-left: rem(-1.5px);
    background-color: #efca53;
    box-shadow: 0 0 0 1px rgba($black, 0.45);

    &--on {
      height: rem(17px);
      top: rem(-6px);
      width: rem(4px);
      margin-left: rem(-2px);
    }
  }

  &__handle {
    position: absolute;
    top: 50%;
    width: rem(12px);
    height: rem(12px);
    margin: rem(-6px) 0 0 rem(-6px);
    border-radius: 50%;
    background-color: $white;
    pointer-events: none;
  }

  // ── buttons row ─────────────────────────────────────────────────────────
  &__btns {
    display: flex;
    align-items: center;
    gap: rem(4px);
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(32px);
    height: rem(32px);
    flex: none;
    background: none;
    border: none;
    color: $white;
    cursor: pointer;

    &:hover {
      color: var(--color-brand-400);
    }

    &:focus-visible {
      outline: 2px solid #efca53;
      outline-offset: -2px;
    }

    &--on {
      color: var(--color-brand-400);
    }
  }

  &__time {
    @include overline;

    color: rgba($white, 0.85);
    font-variant-numeric: tabular-nums;
    margin-left: rem(4px);
  }

  &__spacer {
    flex: 1;
  }

  &__vol {
    display: flex;
    align-items: center;
    gap: rem(4px);
  }

  &__vol-range {
    width: rem(70px);
    accent-color: var(--color-brand-400);
    cursor: pointer;

    // A narrow screen keeps the mute button and drops the slider: the device has its
    // own volume keys, and the room is better spent on the scrub bar.
    @media (max-width: $sm) {
      display: none;
    }
  }

  // ── captions menu ───────────────────────────────────────────────────────
  &__cc {
    position: relative;
  }

  &__menu {
    position: absolute;
    right: 0;
    bottom: calc(100% + #{rem(6px)});
    z-index: 2;
    min-width: rem(180px);
    margin: 0;
    padding: rem(4px);
    list-style: none;
    background-color: rgba($black, 0.96);
    border: 1px solid rgba($white, 0.25);

    li::before {
      content: none; // the global li decoration
    }
  }

  &__opt {
    display: flex;
    align-items: center;
    gap: rem(6px);
    width: 100%;
    padding: rem(6px) rem(8px);
    background: none;
    border: none;
    color: rgba($white, 0.85);
    font-size: rem(13px);
    text-align: left;
    cursor: pointer;

    &:hover {
      background-color: rgba($white, 0.12);
    }

    &--on {
      color: $white;
    }
  }

  &__opt-tick {
    flex: none;

    &--off {
      visibility: hidden;
    }
  }
}
</style>
