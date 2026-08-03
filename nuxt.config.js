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
    // Server-only. Sent as X-QHLD-Token when forwarding a search rating, so the secret
    // never reaches the browser — see server/api/search-rating.post.js. Runtime, not
    // build-time: it has to be present in the container's environment, and a value baked
    // at build time would ship inside the image.
    searchRatingToken: process.env.NUXT_SEARCH_RATING_TOKEN || "",

    public: {
      backendUrl:
        process.env.NUXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
      homebuilderUrl:
        process.env.NUXT_PUBLIC_HOMEBUILDER_URL ||
        "https://homebuilder.quehacenlosdiputados.es",
      knowledgebase: process.env.NUXT_PUBLIC_KNOWLEDGEBASE || "politicas",
      useAlerts: process.env.NUXT_PUBLIC_USE_ALERTS === "true",
      shortname: process.env.NUXT_PUBLIC_SHORTNAME || "qhld",
    },
  },

  gtag: {
    initCommands: [
      ["consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        wait_for_update: 500,
      }],
    ],
  },

  cookieControl: {
    locales: ["es"],
    // 6-month consent expiry (AEPD-aligned), overrides 1yr default
    cookieExpiryOffsetMs: 1000 * 60 * 60 * 24 * 180,
    localeTexts: {
      es: {
        // Override module default: removes non-compliant implied-consent sentence
        bannerDescription: "Utilizamos cookies propias y de terceros para mostrarle la página web y comprender cómo la utiliza, con el fin de mejorar nuestros servicios. Puede aceptarlas, rechazarlas o configurar sus preferencias.",
        // Unambiguous reject labels per AEPD (defaults: "Acepto lo necesario" / "Borrar todo")
        decline: "Rechazar",
        declineAll: "Rechazar todo",
      },
    },
    colors: {
      checkboxInactiveBackground: "#d0d0d0",
      checkboxActiveBackground: "#1d1d1b",
      barButtonHoverBackground: "#a3d5c8",
      barButtonHoverColor: "#000",
    },
    cookies: {
      necessary: [],
      optional: [
        {
          id: "ga",
          name: { es: "Google Analytics" },
          description: { es: "Cookies de analítica. Nos ayudan a entender cómo se usa el sitio." },
          links: { "Política de cookies": "/politica-de-cookies" },
          targetCookieIds: ["_ga", "_gid", "_gat", "_ga_E3P8ZBBM2R"],
        },
      ],
    },
  },

  modules: ["@nuxt/ui", "@nuxt/image", "@nuxt/fonts", "@nuxt/icon", "@nuxtjs/seo", '@vueuse/nuxt', 'nuxt-gtag', '@dargmuesli/nuxt-cookie-control', "@pinia/nuxt"],

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

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

  css: ["~/styles/App.scss", "~/assets/css/main.css"],

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
    compressPublicAssets: true,
  },
});