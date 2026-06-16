<template>
  <UApp :locale="es">
    <div id="app">
      <NuxtLoadingIndicator color="rgb(163, 213, 200)" :height="8" />
      <NuxtRouteAnnouncer />
      <Navbar
        pre-image="/img/yellow.png"
        :links="MENU"
        :logo="LOGO"
        :disclaimer="DISCLAIMER"
      />
      <div class="page-container">
        <NuxtPage />
      </div>
      <PageFooter />
    </div>
  </UApp>
</template>

<script setup>
import { es } from '@nuxt/ui/locale'
import config from "@/config";

const MENU = config.MENU;
const DISCLAIMER = config.DISCLAIMER;
const LOGO = config.LOGO;

// Site-wide default OG image — overridden per-page by detail pages via defineOgImage()
useSeoMeta({
  ogImage: { url: '/img/share.png', width: 871, height: 564 },
  twitterImage: '/img/share.png',
});

// Global Schema.org — Organisation + WebSite for all pages
useSchemaOrg([
  defineOrganization({
    name: 'Qué hacen los diputados',
    url: 'https://www.quehacenlosdiputados.es',
    logo: '/img/logo.svg',
    sameAs: ['https://twitter.com/QHLD_'],
  }),
  defineWebSite({
    name: 'Qué hacen los diputados',
    description: 'Que todos los días sean de puertas abiertas en el Congreso de los Diputados',
  }),
]);
</script>

<style lang="scss">
.page-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
