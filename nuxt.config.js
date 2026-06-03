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
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.quehacenlosdiputados.es',
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

  sitemap: {
    // Increase cache from default 10min — data updates at most daily.
    cacheMaxAgeSeconds: 3600,
    sitemaps: {
      // Static/app-discovered pages, minus noindex legal pages (those shouldn't be submitted)
      pages: {
        includeAppSources: true,
        exclude: ['/aviso-legal', '/politica-de-cookies', '/politica-de-privacidad'],
      },
      // Dynamic entity pages (deputies, groups, topics)
      entities: {
        sources: ['/api/__sitemap__/entities'],
      },
      // Recent initiatives (~2,000 newest, 24h cached). Full inclusion deferred to FastAPI migration.
      initiatives: {
        sources: ['/api/__sitemap__/initiatives'],
      },
    },
  },

  runtimeConfig: {
    public: {
      backendUrl:
        process.env.NUXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
      homebuilderUrl:
        process.env.NUXT_PUBLIC_HOMEBUILDER_URL ||
        "https://homebuilder.quehacenlosdiputados.es",
      gaId: process.env.NUXT_PUBLIC_GA_ID || "",
      knowledgebase: process.env.NUXT_PUBLIC_KNOWLEDGEBASE || "politicas",
      useAlerts: process.env.NUXT_PUBLIC_USE_ALERTS === "true",
      shortname: process.env.NUXT_PUBLIC_SHORTNAME || "qhld",
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