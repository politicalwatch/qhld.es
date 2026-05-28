<template>
  <a
    class="c-save-alert__button u-border-link u-uppercase"
    href="#"
    @click.prevent="saveAlert"
  >
    <Icon icon="mdi:bell" color="#2d4252" />
    Crea una alerta
  </a>
</template>

<script setup>
import { ref, toRefs } from "vue";
import Swal from "sweetalert2";
import { Icon } from "@iconify/vue";

import api from "@/api";

const props = defineProps({
  searchParams: {
    type: Object,
  },
});

const { searchParams } = toRefs(props);

const errors = ref(null);

const saveAlert = async () => {
  let search_params = Object.assign({}, searchParams.value);
  if (search_params.hasOwnProperty("page")) delete search_params.page;

  if (!search_params.hasOwnProperty("knowledgebase"))
    search_params["knowledgebase"] = "politicas";

  // ensure some params are array
  if (search_params.hasOwnProperty("subtopic"))
    search_params.subtopics =
      search_params.subtopics.constructor !== Array
        ? [search_params.subtopics]
        : search_params.subtopics;
  if (search_params.hasOwnProperty("tags"))
    search_params.tags =
      search_params.tags.constructor !== Array
        ? [search_params.tags]
        : search_params.tags;

  const { value: email } = await Swal.fire({
    title: "Crea una alerta personalizada",
    text: "Te enviaremos un correo electrónico cada vez que haya alguna novedad en el Congreso de los Diputados relacionada con los criterios seleccionados",
    footer:
      "Al crear una alerta manifiestas estar conforme con la Política de privacidad de QHLD.",
    input: "email",
    inputPlaceholder: "nombre@dominio.com",
    inputValidator: (value) => {
      if (!value) {
        return "Debes introducir un correo electrónico.";
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return "Debes introducir un correo electrónico válido.";
      }
    },
    imageUrl: "/img/email-alert-icon.svg",
    imageWidth: 64,
    imageHeight: 56,
    imageAlt: "Imagen de correo electrónico",
    animation: false,
    focusConfirm: false,
    confirmButtonText: "Crear alerta",
    confirmButtonAriaLabel: "Crear alerta",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonAriaLabel: "Cancelar",
  });
  if (email) {
    let params = {
      email: email,
      search: JSON.stringify(search_params),
    };
    api
      .saveAlert(params)
      .then(() => {
        Swal.fire({
          title: "Alerta creada",
          text: "Recibirá en breve un correo de confirmación",
          focusConfirm: false,
          icon: "success",
        });
      })
      .catch((error) => {
        errors.value = error.response;
        const limited = error.response.status === 429;
        Swal.fire({
          title: limited
            ? "Limite excedido por hora"
            : "Error al crear la alerta",
          text: "Inténtalo de nuevo más tarde",
          focusConfirm: false,
          icon: "error",
        });
      });
  } else {
    console.log("No email provided, alert not saved.");
  }
};
</script>

<style scoped lang="scss">
.c-save-alert {
  &__button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
