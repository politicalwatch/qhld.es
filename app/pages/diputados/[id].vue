<template>
  <div
    v-if="deputy"
    id="deputy"
    :class="[
      'u-margin-bottom-10',
      'c-deputy',
      { 'c-deputy--birthday': isBirthday() },
    ]"
  >
    <div class="o-container c-deputy__inactive" v-if="!deputy.active">
      <message type="info" icon>
        <h4 class="u-uppercase">Causó baja en el Congreso de los Diputados</h4>
      </message>
    </div>
    <div class="o-container">
      <div class="o-grid">
        <div class="o-grid__col u-12 u-4@sm">
          <div class="c-deputy__image_container">
            <img
              class="c-deputy__image"
              :src="deputy.image"
              :alt="'Foto de ' + deputy.name"
            />
            <div class="c-deputy__links">
              <social-icon
                v-if="deputy.hasOwnProperty('email')"
                :link="`mailto:${deputy.email}?subject=Contacto a través de qhld.es`"
                icon="mail"
              ></social-icon>
              <social-icon
                v-if="deputy.hasOwnProperty('twitter')"
                :link="deputy.twitter"
                icon="twitter"
              ></social-icon>
              <social-icon
                v-if="deputy.hasOwnProperty('facebook')"
                :link="deputy.facebook"
                icon="facebook"
              ></social-icon>
              <social-icon
                v-if="deputy.hasOwnProperty('website')"
                :link="deputy.website"
                icon="website"
              ></social-icon>
            </div>
            <congress-link
              v-if="deputy.hasOwnProperty('url')"
              :url="deputy.url"
            ></congress-link>
          </div>
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <div class="c-deputy__footprint">
            <footprint :footprint="deputy.footprint" />
            <Tooltip
              text="<p>Nustro índice parlamentario es el reflejo de la actividad de un diputado o diputada.</p><p>A mayor índice, consideramos que su trabajo parlamentario es más relevante.</p>"
              routeLink="footprint"
              position="bottom"
            >
              <button class="c-deputy__footprint-more-info">
                ¿Qué es esto?
              </button>
            </Tooltip>
          </div>
          <h1 class="c-deputy__name">{{ deputy.name }}</h1>
          <h3 class="c-deputy__group" v-if="parliamentarygroup">
            <router-link
              :to="{
                name: 'parliamentarygroup',
                params: { id: parliamentarygroup.id },
              }"
            >
              {{ parliamentarygroup.name }}
            </router-link>
          </h3>
          <div class="c-deputy__personal-info">
            <span class="c-deputy__personal">
              <party-logo-icon
                v-if="deputy.party_name"
                :party="deputy.party_name"
              />
              {{ deputy.party_name ?? "" }}
            </span>
            <span class="c-deputy__personal"
              ><Icon icon="mdi:location" />{{ deputy.constituency }}</span
            >
            <span class="c-deputy__personal">
              <icon v-if="isBirthday()" icon="mdi:birthday-cake-outline" />
              {{ deputy.age }}
              años
            </span>
            <span class="c-deputy__personal">{{ getLegislatures() }}</span>
          </div>
          <info-dropdown title="Ficha personal">
            <p
              class="c-info-dropdown__content__item"
              v-for="bio in deputy.bio"
              :key="bio"
            >
              {{ bio }}
            </p>
          </info-dropdown>
          <info-dropdown title="Cargos">
            <p
              class="c-info-dropdown__content__item"
              v-for="position in deputy.public_position"
              :key="position"
            >
              {{ position }}
            </p>
          </info-dropdown>
          <info-dropdown title="Bienes y actividades">
            <ul>
              <li v-for="(link, declaration) in deputy.extra.declarations">
                <a
                  class="c-info-dropdown__content__item"
                  :key="declaration"
                  :href="link"
                  target="_blank"
                >
                  {{ declaration }}
                </a>
              </li>
            </ul>
          </info-dropdown>
        </div>
      </div>
    </div>

    <div v-if="footprintByTopics.length > 0" class="o-container o-section">
      <h2 class="c-deputy__title u-margin-bottom-4 u-uppercase">
        Temáticas destacadas
      </h2>
      <FootprintRangeChart
        :dataset="footprintByTopics"
        :entityName="deputy.name"
        :entityImage="deputy.image"
        :entityColor="groupColor"
      />
      <p>
        El tamaño es relativo al valor máximo del índice parlamentario para cada
        temática.
        <router-link
          :to="{ name: 'footprint' }"
          target="_blank"
          style="text-decoration: none !important"
          >Consulta aquí cómo funciona nuestro índice
          parlamentario.</router-link
        >
      </p>
    </div>

    <div
      v-if="latestInitiatives && latestInitiatives.length"
      class="o-container o-section"
    >
      <div class="c-deputy__initiatives-header">
        <h2 class="c-deputy__title u-margin-bottom-4 u-uppercase">
          Últimas iniciativas
        </h2>
        <router-link
          v-if="totalInitiatives > initiativesToShow"
          :to="{
            name: 'results',
            params: {
              data:
                'deputy=' + deputy.name + '&author=' + parliamentarygroup.name,
            },
          }"
          class="c-deputy__initiatives-more u-border-link u-hide u-block@sm u-uppercase"
          >Ver todas
        </router-link>
      </div>
      <results
        layout="extended"
        :initiatives="latestInitiatives"
        :topicsStyles="styles.topics"
      />
      <router-link
        v-if="totalInitiatives > initiativesToShow"
        :to="{
          name: 'results',
          params: {
            data:
              'deputy=' + deputy.name + '&author=' + parliamentarygroup.name,
          },
        }"
        class="c-deputy__initiatives-more u-border-link u-hide@sm u-uppercase"
        >Ver todas
      </router-link>
    </div>
    <div class="o-container" v-else>
      <message type="info" icon>
        No se han encontrado iniciativas para este diputado/a
      </message>
    </div>
    <save-alert
      v-if="use_alerts"
      :searchparams="{ deputy: deputy.name }"
      :text="deputy.name"
    />
  </div>
  <div v-else class="o-container o-section u-margin-bottom-10">
    <loader title="Cargando datos" subtitle="Puede llevar unos segundos" />
  </div>
</template>

<script setup>
definePageMeta({ name: 'deputy' });
import { ref, computed, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useParliamentStore } from "@/stores/parliament";
import { useElementSize } from "@vueuse/core";
import { Icon } from "@iconify/vue";

import Footprint from "@/components/Footprint.vue";
import CongressLink from "@/components/CongressLink.vue";
import Message from "@/components/Message.vue";
import Results from "@/components/Results.vue";
import InfoDropdown from "@/components/InfoDropdown.vue";
import Loader from "@/components/Loader.vue";
import PartyLogoIcon from "@/components/PartyLogoIcon.vue";
import SaveAlert from "@/components/SaveAlert.vue";
import SocialIcon from "@/components/SocialIcon.vue";
import FootprintRangeChart from "@/components/FootprintRangeChart.vue";
import Tooltip from "@/components/Tooltip.vue";
import api from "@/api";
import config from "@/config";

const route = useRoute();
const router = useRouter();

const store = useParliamentStore();
const { allTopics, footprintRange, allParliamentaryGroups } =
  storeToRefs(store);

const deputy = ref(null);
const parliamentarygroup = ref(null);
const latestInitiatives = ref(null);
const totalInitiatives = ref(null);
const initiativesToShow = 6;
const errors = ref(null);
const use_alerts = config.USE_ALERTS;
const styles = config.STYLES;

const headTitle = computed(() => {
  return deputy.value
    ? `${deputy.value.name} - Qué hacen los diputados`
    : "Qué hacen los diputados";
});

const footprintByTopics = computed(() => {
  if (deputy.value) {
    const deputyFootprintByTopic = deputy.value.footprint_by_topics
      .filter((item) =>
        allTopics.value.some((topic) => topic.name === item.name)
      )
      .filter((item) => item.score > 0)
      .slice(0, 5)
      .map((item) => {
        const topic = footprintRange.value.find(
          (topic) => topic.name === item.name
        );
        return {
          ...item,
          max: topic?.deputy?.max.score ?? 100,
          min: topic?.deputy?.min.score ?? 0,
        };
      });

    return deputyFootprintByTopic;
  }
  return [];
});

useSeoMeta({
  title: () => headTitle.value,
  ogTitle: () => headTitle.value,
  ogImage: () => (deputy.value ? deputy.value.image : null),
});

const isBirthday = () => {
  const date = new Date(deputy.value.birthdate);
  const today = new Date();
  return (
    date.getDate() == today.getDate() && date.getMonth() == today.getMonth()
  );
};

const groupColor = computed(() => {
  return (
    (deputy.value.party_name &&
      config.STYLES.parties[deputy.value.party_name]?.color) ??
    "#efca53"
  );
});

const getDeputy = async () => {
  api
    .getDeputy(route.params.id)
    .then((response) => {
      deputy.value = response;
      parliamentarygroup.value = allParliamentaryGroups.value.find(
        (allPG) => allPG.shortname === deputy.value.parliamentarygroup
      );
      getLatestInitiatives();
    })
    .catch((error) => {
      errors.value = error;
      router.push({ name: "Page404" });
    });
};
const getLatestInitiatives = () => {
  api
    .getInitiatives({ deputy: deputy.value.name, per_page: initiativesToShow })
    .then((response) => {
      if (response.initiatives) {
        latestInitiatives.value = response.initiatives;
        totalInitiatives.value = response.query_meta.total;
      }
    })
    .catch((error) => (errors.value = error));
};
const getLegislatures = () => {
  return "Legislaturas " + deputy.value.legislatures;
};

onBeforeMount(getDeputy);
</script>

<style lang="scss" scoped>
.c-deputy {
  &__footprint {
    display: flex;
    align-items: center;
    text-decoration: none;

    .c-footprint {
      margin-bottom: 0;
    }
  }

  &__footprint-more-info {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 8px;
    font-weight: 500;
    font-size: 0.95rem;
    color: $secondary-dark;
  }

  &__image_container {
    width: rem($spacer-unit * 16);
    margin: 0 auto 30px;
    text-align: center;

    @media (min-width: $md) {
      width: rem($spacer-unit * 16);
    }
  }

  &__image {
    width: rem($spacer-unit * 16);
    height: rem($spacer-unit * 16);
    border-radius: 50%;
    object-fit: cover;
    display: block;
    z-index: 0;
  }

  &__name {
    font-size: rem(56px);
    line-height: 72px;
    text-align: center;
    margin-top: 16px;
    margin-bottom: 0;

    @media (min-width: $sm) {
      text-align: left;
    }
  }

  &__group {
    font-family: $font-primary;
    font-size: 24px;
    line-height: 32px;
    text-transform: uppercase;
    text-align: center;

    @media (min-width: $sm) {
      text-align: left;
    }

    a {
      font-weight: 300;
      text-decoration: none;
      color: $secondary-dark;
    }
  }

  &__description {
    @include subtitle;

    & {
      text-align: center;
    }

    @media (min-width: $sm) {
      text-align: left;
    }
  }

  &__links {
    margin-top: 32px;
    margin-bottom: 32px;

    a {
      margin-left: 4px;
      margin-right: 4px;
      display: inline-block;
    }
  }

  &__extra {
    margin-top: 8px;
    margin-bottom: 8px;
    text-align: center;

    @media (min-width: $md) {
      text-align: left;
    }
  }

  &__personal {
    font-family: $font-headline;
    padding-right: 22px;
    padding-left: 22px;
    border-right: solid 2px $black;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-bottom: 96px;

    &:last-child {
      border: none;
    }

    &:first-child {
      padding-left: 0;
    }

    span {
      margin-right: 4px;
    }

    .c-party_logo_icon {
      width: 32px;
      height: 32px;
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 8px;

      img {
        width: 50%;
        height: 50%;
      }
    }
  }

  &__more {
    text-align: center;

    @media (min-width: $md) {
      text-align: left;
    }

    a,
    a:hover {
      color: $secondary-dark;
      font-weight: 500;
      text-decoration: none;

      .c-icon {
        margin-left: 8px;
      }
    }
  }

  &__info {
    display: inline-block;
    vertical-align: top;
    font-size: 14px;
    margin-top: rem($spacer-unit * 8);

    h3 {
      color: $secondary;
      font-size: 12px;
    }

    p,
    a {
      margin-top: 8px;
      margin-bottom: 8px;
    }

    a {
      font-weight: 500;
      color: $secondary-dark;
    }

    span {
      margin-right: 8px;
    }
  }

  &__hidden {
    display: none;
  }

  &--birthday {
    background: url("../assets/birthday-bg.png");
  }

  &__personal-info {
    display: flex;
  }

  &__inactive {
    .c-message {
      .c-message__wrapper {
        background-color: $lightgrey;
      }

      &__wrapper {
        width: 100%;
        padding-top: 16px;
        padding-bottom: 16px;
        display: flex;
        justify-content: center;

        h4 {
          margin-bottom: 0;
          line-height: 24px;
        }
      }

      &__icon {
        position: initial;
        margin-top: 2px;
        margin-right: 16px;

        svg path {
          fill: black !important;
        }
      }
    }
  }
  &__initiatives-header {
    display: flex;
    justify-content: space-between;
  }

  &__initiatives-more {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  &__title {
    text-align: center;
    width: 100%;

    @media (min-width: $sm) {
      text-align: left;
      width: auto;
    }
  }
}

.c-deputy__links a.c-button {
  display: inline-block;
}
.alerts-block {
  padding-bottom: 0rem;
  a {
    color: #fff;
  }
}
@media (max-width: 768px) {
  .alerts-block {
    text-align: center;
    margin-top: 0rem;
  }
}
</style>
