import svgLoader from "vite-svg-loader";

const svgoConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  site: {
    url: process.env.BASE_URL || 'https://www.quehacenlosdiputados.es',
    name: 'Qué hacen los diputados',
    defaultLocale: 'es',
    description: 'Que todos los días sean de puertas abiertas en el Congreso de los Diputados',
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'es' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@QHLD_' },
        { name: 'twitter:creator', content: '@QHLD_' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      backendUrl:
        process.env.VITE_VUE_APP_BACKEND_URL || "http://localhost:5000",
      homebuilderUrl:
        process.env.VITE_VUE_APP_HOMEBUILDER_URL ||
        "https://homebuilder.quehacenlosdiputados.es",
      gaId: process.env.VITE_GA_ID || "",
      knowledgebase: process.env.VITE_KNOWLEDGEBASE || "politicas",
      useAlerts: process.env.VITE_VUE_APP_USE_ALERTS === "true",
      shortname: process.env.VITE_VUE_APP_SHORTNAME || "qhld",
    },
  },

  modules: ["@nuxt/image", "@nuxt/fonts", "@nuxt/icon", "@nuxtjs/seo"],

  image: {
    domains: ["www.congreso.es"],
    format: ["webp"],
    quality: 80,
  },

  icon: {
    serverBundle: "local",
  },

  fonts: {
    families: [
      { name: 'Fjalla One', provider: 'google', weights: [400] },
      { name: 'Rubik', provider: 'google', weights: [300, 400, 500] },
    ],
  },

  devtools: {
    enabled: true
  },

  css: ["~/styles/App.scss"],

  vite: {
    plugins: [svgLoader({ svgoConfig })],
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["import"],
          additionalData: `@use "sass:math"; @import "@/styles/resources";`,
        },
      },
    },
  },

  routeRules: {
    "/huella": { redirect: { to: "/indice-actividad-parlamentaria", statusCode: 301 } },
  },

  nitro: {
    preset: "node-server",
  },
});