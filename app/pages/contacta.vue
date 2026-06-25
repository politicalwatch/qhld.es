<template>
  <div>
    <div id="about" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid">
        <div class="o-grid__col u-12 u-4@sm">
          <page-header title="Contacta" />
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <p>
            <a
                href="mailto:info@politicalwatch.es?subject=Contacto+a+través+de+qhld.es"
                target="_blank"
            >
              Escríbenos un email
            </a>
          o contacta con nosotras a través de este formulario:
          </p>
          <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSeAsx7Cj2pC5qj2piMZPLG5j_PXMdARxVHEfnQikBvqyAQJAA/viewform?embedded=true" width="640" height="1060" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'contact' });
useSeoMeta({
  title: 'Contacto',
  ogTitle: 'Contacto',
  ogType: 'website',
});
import PageHeader from "@/components/PageHeader.vue";
</script>

<style scoped lang="scss"></style>
