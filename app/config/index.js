export default {
  SHORTNAME: import.meta.env.VITE_VUE_APP_SHORTNAME || "qhld",
  BACKEND_URL:
    import.meta.env.VITE_VUE_APP_BACKEND_URL || "http://localhost:5000",
  HOMEBUILDER_URL:
    import.meta.env.VITE_VUE_APP_HOMEBUILDER_URL ||
    "https://homebuilder.quehacenlosdiputados.es",
  GOOGLE_ANALYTICS: import.meta.env.VUE_APP_GOOGLE_ANALYTICS || "XXXXXXXXXXXX",
  USE_ALERTS: import.meta.env.VITE_VUE_APP_USE_ALERTS === "true",
  KNOWLEDGEBASE: import.meta.env.VITE_KNOWLEDGEBASE || "politicas",
  SCANNER_HELPTEXT: import.meta.env.VUE_APP_SCANNER_HELPTEXT || "",
  MENU: [
    {
      route: "deputies",
      name: "Diputados",
      condition: true,
    },
    {
      route: "parliamentarygroups",
      name: "Grupos",
      condition: true,
    },
    {
      route: "search",
      name: "Iniciativas",
      condition: true,
    },
    {
      route: "topics",
      name: "Temáticas",
      condition: true,
    },
  ],
  DISCLAIMER: {},
  LOGO: "/img/logo.svg",

  DEFAULT_PAGE_TITLE: "Qué hacen los diputados",
  DEFAULT_METATAGS: [
    {
      name: "description",
      content:
        "Que todos los días sean de puertas abiertas en el Congreso de los Diputados",
    },
    {
      name: "keywords",
      content:
        "transparencia, incidencia política, participación, investigación, periodismo de datos, política, pobreza, exclusión social, justicia social, españa, congreso de los diputados, monitorización parlamentaria",
    },
    {
      itemprop: "image",
      content: "https://ciecode.es/assets/images/projects/qhld/qhld.png",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:url",
      content: "https://quehacenlosdiputados.es",
    },
    {
      name: "twitter:title",
      content: "Qué hacen los diputados",
    },
    {
      name: "twitter:description",
      content:
        "Que todos los días sean de puertas abiertas en el Congreso de los Diputados",
    },
    {
      name: "twitter:creator",
      content: "@QHLD_",
    },
    {
      name: "twitter:image:src",
      content: "https://ciecode.es/assets/images/projects/qhld/qhld.png",
    },
    {
      property: "og:title",
      content: "Qué hacen los diputados",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://quehacenlosdiputados.es",
    },
    {
      property: "og:image",
      content: "https://ciecode.es/assets/images/projects/qhld/qhld.png",
    },
    {
      property: "og:description",
      content:
        "Que todos los días sean de puertas abiertas en el Congreso de los Diputados",
    },
    {
      property: "og:site_name",
      content: "Qué hacen los diputados",
    },
  ],
  STYLES: {
    topics: {
      "Conductas adictivas": {
        shortname: "Adicciones",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "adictivas-01.svg",
      },
      Vivienda: {
        shortname: "Vivienda",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "vivienda-01.svg",
      },
      "Comercio internacional": {
        shortname: "Comercio internacional",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "comercio-01.svg",
      },
      "Población gitana": {
        shortname: "Población gitana",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "gitana-01.svg",
      },
      "Democracia y derechos en la era digital": {
        shortname: "Derechos digitales",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "digitales-01.svg",
      },
      "Protección social": {
        shortname: "Protección social",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "proteccion-01.svg",
      },
      "Cooperación al desarrollo": {
        shortname: "Cooperación al Desarrollo",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "cooperacion-01.svg",
      },
      Infancia: {
        shortname: "Infancia",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "infancia-01.svg",
      },
      "Conflictos internacionales y construcción de paz": {
        shortname: "Conflictos y Paz",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "paz-01.svg",
      },
      Fiscalidad: {
        shortname: "Fiscalidad",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "fiscalidad-01.svg",
      },
      "Personas sin hogar": {
        shortname: "Personas sin hogar",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "sintecho-01.svg",
      },
      Migraciones: {
        shortname: "Migraciones",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "extranjera-01.svg",
      },
      "Calidad democrática": {
        shortname: "Democracia",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "democracia-01.svg",
      },
      Educación: {
        shortname: "Educación",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "educacion-01.svg",
      },
      Sanidad: {
        shortname: "Sanidad",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "sanidad-01.svg",
      },
      "Cambio climático y política energética": {
        shortname: "Energía y Clima",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "clima-01.svg",
      },
      "Población reclusa": {
        shortname: "Población reclusa",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "reclusa-01.svg",
      },
      Empleo: {
        shortname: "Empleo",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "empleo-01.svg",
      },
      "España vaciada": {
        shortname: "España vaciada",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "",
      },
      "Personas con discapacidad": {
        shortname: "Discapacidad",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "diversidad-01.svg",
      },
      "Igualdad de género": {
        shortname: "Igualdad de género",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "igualdad-01.svg",
      },
      "Personas mayores": {
        shortname: "Mayores",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "mayores-01.svg",
      },
      Dependencia: {
        shortname: "Dependencia",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "dependencia-01.svg",
      },
      "Colectivo LGTBI": {
        shortname: "LGTBI",
        color: "#A3D5C8",
        color_alt: "#5BA697",
        image: "lgtbi-01.svg",
      },
      "ODS 1 Fin de la pobreza": {
        shortname: "ODS 1",
        color: "#eb1c2d",
        image: "ods-1.svg",
        orgs_logos: ["caritas.png"],
      },
      "ODS 2 Hambre cero": {
        shortname: "ODS 2",
        color: "#d3a029",
        image: "ods-2.svg",
        orgs_logos: ["fao.png"],
      },
      "ODS 3 Salud y bienestar": {
        shortname: "ODS 3",
        color: "#4c9f38",
        image: "ods-3.svg",
        orgs_logos: ["salud_por_der.png", "isglobal.png"],
      },
      "ODS 4 Educación de calidad": {
        shortname: "ODS 4",
        color: "#c52333",
        image: "ods-4.svg",
        orgs_logos: ["cmi.png"],
      },
      "ODS 5 Igualdad de género": {
        shortname: "ODS 5",
        color: "#ed4135",
        image: "ods-5.svg",
        orgs_logos: ["cedawsombra.png", "coordinadora.png", "fpfe_g.png"],
      },
      "ODS 6 Agua limpia y saneamiento": {
        shortname: "ODS 6",
        color: "#00aed9",
        image: "ods-6.svg",
        orgs_logos: ["catedra-aquae.png", "ongawa.png"],
      },
      "ODS 7 Energía asequible y no contaminante": {
        shortname: "ODS 7",
        color: "#fdb713",
        image: "ods-7.svg",
        orgs_logos: ["esf.png"],
      },
      "ODS 8 Trabajo decente y crecimiento económico": {
        shortname: "ODS 8",
        color: "#8f1838",
        image: "ods-8.svg",
        orgs_logos: ["ccoo.png"],
      },
      "ODS 9 Industria, innovación e infraestructura": {
        shortname: "ODS 9",
        color: "#f06a38",
        image: "ods-9.svg",
        orgs_logos: ["foretica.png"],
      },
      "ODS 10 Reducción de las desigualdades": {
        shortname: "ODS 10",
        color: "#dd1367",
        image: "ods-10.svg",
        orgs_logos: ["congde.png", "caritas.png"],
      },
      "ODS 11 Ciudades y comunidades sostenibles": {
        shortname: "ODS 11",
        color: "#f69c39",
        image: "ods-11.svg",
        orgs_logos: ["idl_uam.png", "itgespub.png"],
      },
      "ODS 12 Producción y consumo responsables": {
        shortname: "ODS 12",
        color: "#cf8d2a",
        image: "ods-12.svg",
        orgs_logos: ["hispacoop.png"],
      },
      "ODS 13 Acción por el clima": {
        shortname: "ODS 13",
        color: "#48773e",
        image: "ods-13.svg",
        orgs_logos: ["wwf.png"],
      },
      "ODS 14 Vida submarina": {
        shortname: "ODS 14",
        color: "#007dbc",
        image: "ods-14.svg",
        orgs_logos: ["oceana.png"],
      },
      "ODS 15 Vida de ecosistemas terrestres": {
        shortname: "ODS 15",
        color: "#5cb84d",
        image: "ods-15.svg",
        orgs_logos: ["greenpeace.png"],
      },
      "ODS 16 Paz, justicia e instituciones sólidas": {
        shortname: "ODS 16",
        color: "#02558b",
        image: "ods-16.svg",
        orgs_logos: [],
      },
      "ODS 17 Alianzas para lograr los objetivos": {
        shortname: "ODS 17",
        color: "#183668",
        image: "ods-17.svg",
        orgs_logos: ["mauec.png"],
      },
    },
    subtopics: {},
    defaultColor: "#cecece",
    defaultImage: "placeholder.png",
    parties: {
      Cs: {
        name: "Ciudadanos",
        logo: "cs",
        color: "#ff4f00",
      },
      VOX: {
        name: "VOX",
        logo: "vox",
        color: "#5ac035",
      },
      Vox: {
        name: "VOX",
        logo: "vox",
        color: "#5ac035",
      },
      ERC: {
        name: "Esquerra Republicana",
        logo: "erc",
        color: "#ffbf41",
      },
      "ERC-S": {
        name: "Esquerra Republicana",
        logo: "erc",
        color: "#ffbf41",
      },
      PP: {
        name: "Partido Popular",
        logo: "pp",
        color: "#0056a3",
      },
      "PP - FORO": {
        name: "Partido Popular",
        logo: "pp",
        color: "#0056a3",
      },
      "MÉS COMPROMÍS": {
        name: "Compromís",
        logo: "compromis",
        color: "#f29127",
        "color-gradient":
          "linear-gradient(204deg, #f29127 100%, #ec8427 80%, #de6527 42%, #d13b27 3%)",
      },
      "MÁS PAÍS-EQUO": {
        name: "Más País",
        logo: "maspais",
        color: "#0a7565",
      },
      PDeCAT: {
        name: "Partit Demòcrata",
        logo: "pdecat",
        color: "#114488",
      },
      "JxCAT-JUNTS": {
        name: "Junts per Catalunya",
        logo: "jxcat",
        color: "#40e0d0",
      },
      "JxCat-JUNTS (Junts)": {
        name: "Junts per Catalunya",
        logo: "jxcat",
        color: "#40e0d0",
      },
      BNG: {
        name: "Bloque Nacionalista Galego",
        logo: "bng",
        color: "#76b3dd",
      },
      SUMAR: {
        name: "SUMAR",
        logo: "sumar",
        color: "#e51c55",
      },
      UP: {
        name: "Unidas Podemos",
        logo: "unidaspodemos",
        color: "#ffffff",
      },
      "EC-UP": {
        name: "Podemos",
        logo: "podemos",
        color: "#6b1f5f",
      },
      PODEMOS: {
        name: "Podemos",
        logo: "podemos",
        color: "#6b1f5f",
      },
      IU: {
        name: "Izquierda Unida",
        logo: "iu",
        color: "#b1132f",
      },
      "ECP-GUAYEM EL CANVI": {
        name: "En Comú Podem",
        logo: "encomu",
        color: "#dc2a15",
        "color-gradient": "linear-gradient(135deg, #dc2a15 15%, #6d2d5c 85%)",
      },
      CCa: {
        name: "Coalición Canaria",
        logo: "coalicioncanaria",
        color: "#02abd6",
      },
      "CCa-NC": {
        name: "Coalición Canaria",
        logo: "coalicioncanaria",
        color: "#02abd6",
      },
      "NC-CCa-PNC": {
        name: "Nueva Canaria",
        logo: "nuevacanaria",
        color: "#81c045",
      },
      "CUP-PR": {
        name: "Candidatura d'Unitat Popular",
        logo: "cup",
        color: "#fff200",
      },
      UPN: {
        name: "Unión del Pueblo Navarro",
        logo: "upn",
        color: "#0856b3",
      },
      "¡Teruel Existe!": {
        name: "Teruel Existe",
        logo: "teruelexiste",
        color: "#227e57",
      },
      FAC: {
        name: "Foro Asturias",
        logo: "foroasturias",
        color: "#19375b",
      },
      PRC: {
        name: "Partido Regionalista de Cantabria",
        logo: "prc",
        color: "#bfcd16",
      },
      PSOE: {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "PSC-PSOE": {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "PSE-EE-PSOE": {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "PSE-EE (PSOE)": {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "PsdeG-PSOE": {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "PSIB-PSOE": {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "PSN-PSOE": {
        name: "Partido Socialista Obrero Español",
        logo: "psoe",
        color: "#e30613",
      },
      "EAJ-PNV": {
        name: "Partido Nacionalista Vasco",
        logo: "pnv",
        color: "#dc2a15",
        "color-gradient": "linear-gradient(135deg, #dc2a15 15%, #6d2d5c 85%)",
      },
      "EH Bildu": {
        name: "Euskal Herria Bildu",
        logo: "ehbildu",
        color: "#b4cc16",
      },
    },
  },
};
