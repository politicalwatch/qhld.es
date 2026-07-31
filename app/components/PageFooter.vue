<template>
  <footer class="c-footer u-padding-top-4 u-padding-bottom-2">
    <div class="o-container o-container-fluid">
      <div class="o-grid">
        <div class="o-grid__col u-3@sm c-footer__brand">
          <a href="/" class="c-footer__brand-link">
            <ClientOnly>
              <component
                v-if="DynamicLogo"
                class="c-footer__brand-logo"
                alt="Logo de Qué hacen las diputadas"
                :is="DynamicLogo"
              ></component>
            </ClientOnly>
          </a>
          <StatusBadge />
        </div>
        <div class="o-grid__col u-6@sm u-offset-3@sm">
          <div class="o-grid">
            <div class="o-grid__col u-4@sm c-footer__section">
              <h5 class="c-footer__section-title">Proyecto</h5>
              <div class="c-footer__section-links">
                <router-link :to="{ name: 'about' }" class="c-footer__menu-link"
                  >Acerca</router-link
                >
                <router-link
                  :to="{ name: 'manifest' }"
                  class="c-footer__menu-link"
                  >Manifiesto</router-link
                >
                <router-link
                  :to="{ name: 'footprint' }"
                  class="c-footer__menu-link"
                  >Índice parlamentario</router-link
                >
                <a href="https://www.parlamento2030.es/" target="_blank"
                  >Agenda 2030</a
                >
                <a
                  href="https://politicalwatch.es/investigaciones/congreso-de-los-diputados"
                  target="_blank"
                  >Investigaciones</a
                >
              </div>
            </div>
            <div class="o-grid__col u-4@sm c-footer__section">
              <h5 class="c-footer__section-title">Colabora</h5>
              <div class="c-footer__section-links">
                <a href="https://api.quehacenlosdiputados.es/" target="_blank"
                  >API Docs</a
                >
                <a href="https://github.com/politicalwatch/" target="_blank"
                  >Código fuente</a
                >
                <router-link :to="{ name: 'collaborate' }"
                  >Colabora</router-link
                >
                <router-link :to="{ name: 'collaborate', hash: '#dona' }"
                  >Haz una donación</router-link
                >
                <router-link :to="{ name: 'contact' }">Contacta</router-link>
                <a
                  href="mailto:qhld@politicalwatch.es?subject=Contacto+a+través+de+qhld.es"
                  target="_blank"
                  >Escríbenos</a
                >
              </div>
            </div>
            <div class="o-grid__col u-4@sm c-footer__section">
              <h5 class="c-footer__section-title">Síguenos</h5>
              <div class="c-footer__section-icons">
                <a
                  href="https://bsky.app/profile/politicalwatch.es"
                  aria-label="Go to Bluesky"
                  target="_blank"
                >
                  <!-- Replace with mdi when available -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="c-icon--white"
                    width="1em"
                    height="1em"
                  >
                    <path
                      d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/_PoliticalWatch/"
                  aria-label="Go to Instagram"
                  target="_blank"
                  ><Icon name="mdi:instagram" class="c-icon--white"
                /></a>
                <a
                  href="https://t.me/quehacenlosdiputados"
                  aria-label="Go to Telegram"
                  target="_blank"
                >
                  <Icon name="mdi:telegram" class="c-icon--white" />
                </a>
                <a
                  href="https://github.com/politicalwatch/quehacenlosdiputados.es"
                  aria-label="Go to Github"
                  target="_blank"
                >
                  <Icon name="mdi:github" class="c-icon--white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="o-grid u-margin-top-8">
        <div class="o-grid__col u-4@sm">
          <a href="https://politicalwatch.es" target="_blank">
            <LogoPW
              class="c-footer__brand-logo"
              alt="Logo de Political Watch"
            />
          </a>
        </div>
        <div class="o-grid__col u-8@sm">
          <p class="c-footer__credits">
            &copy; 2011-{{ new Date().getFullYear() }} Political Watch -
            <router-link :to="{ name: 'legalnotice' }" class="u-color-white"
              >Aviso legal</router-link
            >
            -
            <router-link :to="{ name: 'privacypolicy' }" class="u-color-white"
              >Política de privacidad</router-link
            >
            -
            <router-link :to="{ name: 'cookiepolicy' }" class="u-color-white"
              >Política de cookies</router-link
            >
          </p>
        </div>
      </div>
    </div>

    <CookieControl locale="es" />
  </footer>
</template>

<script setup>
import LogoPW from "@/assets/logo-political-watch.svg";

const DynamicLogo = shallowRef(null);

onMounted(() => {
  const versions = ["male", "female", "neutral"];
  const version = versions[Math.floor(Math.random() * versions.length)];
  DynamicLogo.value = defineAsyncComponent(
    () => import(`@/assets/logo-white-${version}.svg`)
  );
});


</script>

<style scoped lang="scss">
.c-footer {
  background-color: $secondary-dark;
  color: $white;

  img {
    width: 200px;
  }

  &__brand {
    &-link {
      display: block;

      .c-footer__brand-logo {
        padding-bottom: rem($spacer-unit);
      }
    }

    &-logo {
      display: block;
      height: auto;
      width: 200px;
      padding-bottom: rem($spacer-unit * 2);
    }
  }

  &__section {
    &-title {
      text-transform: uppercase;
    }

    &-links {
      display: flex;
      flex-direction: column;
      align-items: start;
      a {
        color: $white;
        text-decoration: none;
        line-height: 2;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &-icons {
      a {
        display: inline;
        padding-right: rem($spacer-unit);
        color: $white;
        text-decoration: none;
        line-height: 2;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  &__menu {
    list-style: none;
  }

  &__credits {
    color: $white;
    font-size: rem(14px);
    line-height: 1.5;
    text-align: right;
  }
}
</style>
