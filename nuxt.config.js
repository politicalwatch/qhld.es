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

  modules: ["@pinia/nuxt", "@nuxt/image", "@nuxt/fonts"],

  image: {
    domains: ["www.congreso.es"],
    format: ["webp"],
    quality: 80,
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