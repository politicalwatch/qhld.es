<template>
  <a
    class="c-save-alert__button u-border-link u-uppercase"
    href="#"
    @click.prevent="openModal"
  >
    <Icon name="mdi:bell" style="color: #2d4252" />
    Crea una alerta
  </a>

  <UModal
    v-model:open="isOpen"
    :close="false"
    :ui="{ content: 'c-save-alert__modal', body: 'c-save-alert__body' }"
  >
    <template #body>
      <button
        type="button"
        class="c-save-alert__close"
        aria-label="Cerrar"
        @click="isOpen = false"
      >
        <Icon name="mdi:close" />
      </button>
      <div class="c-save-alert__modal-body">
        <img
          src="/img/email-alert-icon.svg"
          width="64"
          height="56"
          alt="Imagen de correo electrónico"
          class="c-save-alert__icon"
        />
        <h2 class="c-save-alert__title">Crea una alerta personalizada</h2>
        <p class="c-save-alert__description">
          Te enviaremos un correo electrónico cada vez que haya alguna novedad
          en el Congreso de los Diputados relacionada con los criterios
          seleccionados
        </p>
        <UForm
          id="alert-form"
          :state="alertState"
          :validate="validateAlert"
          class="c-save-alert__form"
          @submit="submitAlert"
        >
          <UFormField name="email">
            <UInput
              v-model="alertState.email"
              type="email"
              placeholder="nombre@dominio.com"
              class="c-save-alert__input"
            />
          </UFormField>
        </UForm>
        <div class="c-save-alert__actions">
          <button type="button" class="c-button" @click="isOpen = false">Cancelar</button>
          <button type="submit" form="alert-form" class="u-border-link u-uppercase">Crear alerta</button>
        </div>
      </div>
    </template>

    <template #footer>
      <p class="c-save-alert__footer">
        Al crear una alerta manifiestas estar conforme con la Política de
        privacidad de QHLD.
      </p>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  searchParams: {
    type: Object,
  },
});

const { searchParams } = toRefs(props);

const { $api } = useNuxtApp();
const toast = useToast();

const isOpen = ref(false);
const alertState = reactive({ email: "" });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAlert = (state) => {
  const errors = [];
  if (!state.email) {
    errors.push({ path: "email", message: "Debes introducir un correo electrónico." });
  } else if (!emailPattern.test(state.email)) {
    errors.push({ path: "email", message: "Debes introducir un correo electrónico válido." });
  }
  return errors;
};

const openModal = () => {
  alertState.email = "";
  isOpen.value = true;
};

const submitAlert = async () => {
  let search_params = Object.assign({}, searchParams.value);
  if (search_params.hasOwnProperty("page")) delete search_params.page;

  if (!search_params.hasOwnProperty("knowledgebase"))
    search_params["knowledgebase"] = "politicas";

  // Ensure array params are arrays
  if (search_params.hasOwnProperty("subtopics"))
    search_params.subtopics =
      search_params.subtopics.constructor !== Array
        ? [search_params.subtopics]
        : search_params.subtopics;

  const params = {
    email: alertState.email,
    search: JSON.stringify(search_params),
  };

  isOpen.value = false;

  $api
    .saveAlert(params)
    .then(() => {
      toast.add({
        title: "Alerta creada",
        description: "Recibirá en breve un correo de confirmación",
        color: "success",
        icon: "i-lucide-check",
      });
    })
    .catch((error) => {
      const limited = error?.response?.status === 429;
      toast.add({
        title: limited ? "Limite excedido por hora" : "Error al crear la alerta",
        description: "Inténtalo de nuevo más tarde",
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    });
};
</script>

<style lang="scss">
// Non-scoped: modal content is teleported to <body> so scoped styles can't reach it.
// Pattern matches InitiativesForm.vue's non-scoped datepicker styles.
.c-save-alert {
  &__button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: rem($spacer-unit * 0.5);
  }

  // content slot hook — rounded corners only (no position override — content uses fixed+translate)
  &__modal {
    border-radius: rem($spacer-unit * 0.75);
  }

  // body slot hook — positioning context for the custom × + extra padding
  &__body {
    position: relative;
    padding: rem($spacer-unit * 2.5);
  }

  // custom × positioned inside the body area (top-right of its padding)
  &__close {
    position: absolute;
    top: rem($spacer-unit);
    right: rem($spacer-unit);
    display: inline-flex;
    border: 0;
    background: transparent;
    padding: rem($spacer-unit * 0.5);
    cursor: pointer;
    color: $secondary-dark;
    font-size: rem(24px);
    line-height: 1;
  }

  &__modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: rem($spacer-unit * 2);
  }

  // icon: centered by flex parent (no align-self: flex-start)

  &__title {
    @include th2;

    margin: 0;
  }

  &__description {
    @include tbody;

    margin: 0;
  }

  &__form {
    width: 100%;
  }

  &__input {
    width: 100%;

    input {
      width: 100%;
      border-radius: rem($spacer-unit * 0.5);
      padding: rem($spacer-unit * 0.75) rem($spacer-unit); // less tall than default
    }
  }

  &__actions {
    display: flex;
    width: 100%; // needed for justify-content: center to work correctly
    align-items: center;
    justify-content: center;
    gap: rem($spacer-unit * 2);

    // scale down the oversized global border-link for this context
    .u-border-link {
      height: auto;
      padding: rem($spacer-unit * 0.5) rem($spacer-unit * 1.25);
      border-width: 3px;
      font-size: rem(14px);
    }

    .c-button {
      padding: rem($spacer-unit * 0.25) rem($spacer-unit * 1.25);
      font-size: rem(14px);
    }
  }

  // footer: divider comes from content's divide-y; no extra border needed
  &__footer {
    @include tbody;

    font-size: rem(14px);
    color: $secondary-medium; // #8095a0 — darker, readable (was $secondary #9cb0bf)
    text-align: center;
    margin: 0;
  }
}
</style>
