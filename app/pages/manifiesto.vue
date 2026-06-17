<template>
  <div>
    <div id="about" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid">
        <div class="o-grid__col u-12 u-4@sm">
          <page-header title="Nuestro manifiesto" />
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <h3>Un servicio con vocación pública y responsabilidad de género</h3>
          <p>
            <b>Qué hacen los diputados (QHLD)</b> es un proyecto que tiene ya
            más de 10 años en marcha pero que hoy se renueva con el objetivo de
            retomar fuerzas y continuar trabajando para acortar la distancia
            entre la ciudadanía y sus representantes políticos. Por esta razón,
            desde
            <a href="https://github.com/politicalwatch/">Political Watch</a>
            hemos considerado que el nombre del proyecto también debía adecuarse
            a los tiempos que corren.
          </p>
          <p>
            En Political Watch trabajamos para incorporar el enfoque de género y
            la lucha por la igualdad real en cada uno de los trabajos que
            realizamos; esto es porque somos conscientes de las desigualdades
            estructurales que existen y del camino que queda por recorrer.
          </p>
          <p>
            Por esto además de acciones concretas relacionadas con la promoción
            de la igualdad y la paridad de género, intentamos adaptar también el
            lenguaje que empleamos en todos nuestros proyectos, porque aunque
            sabemos que el lenguaje por sí solo no puede cambiar la realidad, sí
            que la construye y lo que la lengua no nombra está ausente del
            relato.
          </p>
          <p>
            Teniendo en cuenta todo esto, al asumir esta nueva identidad desde
            Political Watch nos planteamos la posibilidad, o más bien la
            necesidad de que esta versión renovada del proyecto se adaptara a
            las necesidades y luchas actuales en materia de lenguaje inclusivo.
            Y es que seguir generalizando y utilizando Diputados para englobar a
            todas las personas que conforman el hemiciclo del Congreso no nos
            sonaba bien.
          </p>
          <p>
            Con todo lo anterior, desde Political Watch hemos decidido mantener
            la versión original en masculino, pero con ciertas particularidades:
          </p>
          <ol>
            <li>
              Nuestra cuenta de Twitter y demás redes sociales presentes y
              futuras usarán siempre una versión abreviada del nombre: QHLD
            </li>
            <li>
              El nombre oficial del proyecto contempla tres alternativas, que en
              la web se mostrarán de manera aleatoria. Estas tres versiones
              implican el uso de la O, la A y la E indistintamente.
            </li>
            <li>
              Todos los documentos y elementos gráficos generados por el
              proyecto utilizarán la versión abreviada del nombre.
            </li>
            <li>
              En las declaraciones públicas se utilizarán indistintamente
              cualquiera de las tres versiones del nombre.
            </li>
          </ol>
          <p>
            Además de estas particularidades en cuanto al nombre del proyecto,
            nos comprometemos a utilizar el lenguaje inclusivo en todas las
            comunicaciones y documentación que generemos, con el objetivo no
            solo de visibilizar a todos los colectivos que sufren las
            consecuencias de la desigualdad de género, sino también de construir
            nuevas narrativas que de una u otra forma enriquecen el lenguaje.
          </p>
          <hr />
          <p>
            Si deseas conocer más sobre nuestro proyecto, sus orígenes y la
            tecnología que hemos desarrollado, haz click
            <router-link :to="{ name: 'about' }">en este enlace</router-link>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'manifest' });
useSeoMeta({
  title: 'Manifiesto',
  ogTitle: 'Manifiesto',
  ogType: 'website',
});
import PageHeader from "@/components/PageHeader.vue";
</script>

<style scoped lang="scss"></style>
