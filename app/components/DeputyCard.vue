<template>
  <div
    v-if="deputy"
    :class="[
      'c-deputy-card',
      `c-deputy-card__${layout}-layout`,
      { 'c-deputy-card--birthday': isBirthday() },
      { 'c-deputy-card--inactive': !deputy.active },
    ]"
  >
    <div class="c-deputy-card__wrapper">
      <router-link
        :to="{ name: 'deputy', params: { id: deputy.id } }"
        style="position: relative"
      >
        <img
          :src="deputy.image"
          :title="deputy.name"
          :class="[
            'c-deputy-card__wrapper__image',
            `c-deputy-card__wrapper__image-${layout}`,
          ]"
        />
        <party-logo-icon
          v-if="layout == 'large' && deputy.party_name"
          :party="deputy.party_name"
          style="position: absolute; bottom: 0; left: 6rem"
        />
      </router-link>

      <div v-if="layout != 'small'" class="c-deputy-card__wrapper__info">
        <footprint
          v-if="layout == 'large'"
          :footprint="getFootprint()"
          :small="true"
        />
        <router-link :to="{ name: 'deputy', params: { id: deputy.id } }">
          <h4 v-html="getSeparatedName()"></h4>
        </router-link>
        <p>{{ deputy.parliamentarygroup }}</p>
        <h5 v-if="layout == 'large'">
          <icon icon="mdi:location" color="#2d4252" :width="18" />{{
            deputy.constituency
          }}
        </h5>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

import config from "@/config";
import Footprint from "@/components/Footprint.vue";
import PartyLogoIcon from "@/components/PartyLogoIcon.vue";

const { deputy, layout, footprint } = defineProps({
  deputy: {
    type: Object,
    required: true,
  },
  layout: {
    type: String,
    default: "medium", // small, medium, large
  },
  footprint: String,
});

const getSeparatedName = () => {
  return deputy.name.split(",").join(",<br/>");
};

const isBirthday = () => {
  const date = new Date(deputy.birthdate);
  const today = new Date();
  return (
    date.getDate() == today.getDate() && date.getMonth() == today.getMonth()
  );
};

const getFootprint = () => {
  if (footprint != "General") {
    const filtered_footprint = deputy.footprint_by_topics.filter(
      (item) => item.name == footprint
    );
    return filtered_footprint[0]?.score ?? 0;
  }
  return deputy.footprint;
};

const groupColor = computed(() => {
  return (
    (deputy.party_name && config.STYLES.parties[deputy.party_name]?.color) ??
    "#A3D5C8"
  );
});
</script>

<style lang="scss" scoped>
.c-deputy-card {
  @include tbody2;

  &--birthday {
    background: url("../assets/birthday-bg-card.png");
    background-size: contain;
    background-position: center;
  }

  &__wrapper {
    display: flex;
    align-items: center;

    &__image-block {
      display: block;
      position: absolute;
    }

    &__image {
      border-radius: 50%;
      object-fit: cover;
      vertical-align: middle;
    }

    &__image-small {
      width: rem($spacer-unit * 2);
      height: rem($spacer-unit * 2);
      margin-right: rem(calc($spacer-unit / 2));
      border: 2px solid $primary;
    }

    &__image-medium {
      width: rem($spacer-unit * 4);
      height: rem($spacer-unit * 4);
      margin-right: rem($spacer-unit);
      border: 2px solid $primary;
    }

    &__image-large {
      width: rem(160px);
      height: rem(160px);
      margin-right: rem($spacer-unit * 2);
      border: 4px solid v-bind(groupColor);
    }

    &__info {
      text-transform: uppercase;

      h4,
      p,
      h5 {
        margin-top: 0px;
        margin-bottom: rem(calc($spacer-unit / 4));
        display: flex;
        justify-content: start;
        align-items: center;
        gap: 4px;
      }
    }
  }

  &__small-layout {
  }

  &__medium-layout {
    display: flex;
    align-items: center;

    &__image {
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid $primary;
      object-fit: cover;
      vertical-align: middle;
    }
    &__name {
      font-family: $font-headline;
      font-size: 1rem;
      text-align: left;
      text-transform: uppercase;

      span {
        @include tbody2;
      }
    }
  }

  &__large-layout {
    display: flex;
    align-items: center;

    &__image {
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid $primary;
      object-fit: cover;
      vertical-align: middle;
    }
    &__name {
      font-family: $font-headline;
      font-size: 1rem;
      text-align: left;
      text-transform: uppercase;

      span {
        @include tbody2;
      }

      h5 {
        svg {
          width: 10px;
          height: auto;
        }
      }
    }
  }

  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

.c-deputy-card.small-layout {
  display: inline-block;
}
.c-deputy-card.medium-layout {
  margin-bottom: rem($spacer-unit);
}

.c-deputy-card--inactive {
  opacity: 0.5;
}
</style>
