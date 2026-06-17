<template>
  <div class="c-party_logo__container">
    <img
      class="c-party_logo__image"
      :src="getLogoSrc()"
      :alt="'Logo de ' + party"
    />
  </div>
</template>

<script setup>
const { party } = defineProps({
  party: { type: String },
});

const logos = {
  Vox: "vox.png",
  "¡Teruel Existe!": "teruelexiste.svg",
  UPN: "upn.jpg",
  UP: "unidaspodemos.png",
  "PsdeG-PSOE": "psoe.png",
  PSOE: "psoe.png",
  "PSE-EE-PSOE": "pse-ee.png",
  "PSC-PSOE": "psc.png",
  PRC: "prc.png",
  "PP - FORO": "pp.png",
  PP: "pp.png",
  PDeCAT: "pdecat.png",
  "NC-CCa-PNC": "nueva_canarias.png",
  "MÉS COMPROMÍS": "compromis.jpg",
  "MÁS PAÍS-EQUO": "mas-pais.jpg",
  "JxCat-JUNTS": "jxcat.png",
  IU: "iu.png",
  FAC: "fac.png",
  ERC: "erc.png",
  "ERC-S": "erc.png",
  "EH Bildu": "bildu.png",
  "ECP-GUAYEM EL CANVI": "encomupodem.jpg",
  "EC-UP": "podemos.jpg",
  PODEMOS: "podemos.jpg",
  "EAJ-PNV": "eajpnv.png",
  Cs: "ciudadanos.png",
  "CUP-PR": "cup.png",
  CCa: "ca.jpeg",
  "CCa-NC": "ca.jpeg",
  BNG: "bng.png",
};

const getLogoSrc = () => {
  let logo = "";
  if (party in logos) {
    logo = new URL(`@/assets/party_logos/${logos[party]}`, import.meta.url)
      .href;
  }
  return logo;
};
</script>

<style scoped lang="scss">
.c-party_logo {
  &__container {
    width: rem($spacer-unit * 10);
    height: rem($spacer-unit * 10);
    border-radius: 50%;
    object-fit: cover;
    display: block;
    position: absolute;
    bottom: rem($spacer-unit * 10 * -0.25);
    left: rem($spacer-unit * 10 * -0.25);
    position: absolute;
    text-align: center;
    background-color: white;
    overflow: hidden;
  }

  &__image {
    max-width: 100%;
    vertical-align: middle;
  }
}
</style>
