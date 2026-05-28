<template>
  <div>
    <div id="about" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid">
        <div class="o-grid__col u-12 u-4@sm">
          <page-header title="Colabora" />
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <h3>
            Como ciudadanía tenemos la responsabilidad cívica de vigilar y de
            ser exigentes con el comportamiento de nuestros representantes
            públicos. Sólo de esta forma podremos tener la democracia que
            necesitamos y que nos merecemos. Desde Qué Hacen Los Diputados
            (QHLD) facilitamos esta labor de vigilancia y tratamos de fomentar
            en la ciudadanía y en los movimientos sociales este espíritu cívico.
          </h3>
          <p>
            A continuación te proponemos una serie de vías a través de las
            cuales puedes colaborar con QHLD en la consecución de dichos
            objetivos.
          </p>

          <h2>Comparte y difunde</h2>
          <p>
            Te animamos a que nos ayudes a dar a conocer Qué Hacen los Diputados
            con las personas de tu entorno y a difundir la información que
            generamos en tus redes sociales. Cuanta más gente vigilante seamos
            más se preocuparán nuestros representantes políticos de cumplir sus
            promesas y de dar respuesta a las necesidades y exigencias de la
            ciudadanía.
          </p>

          <h2>Denuncia e interpela</h2>
          <p>
            Si queremos que los políticos estén a la altura de los retos de
            nuestros tiempos es necesario que sus malas prácticas y sus
            incumplimientos tengan un coste y no pasen desapercibidos. Para
            ello, tienen que sentir que existe una ciudadanía vigilante,
            informada y exigente dispuesta a ponerles en evidencia cuando su
            comportamiento no está a la altura de las circunstancias. Si esta
            presión ciudadana está funcionando con las empresas, puede también
            funcionar con la clase política. Usa la información de QHLD para
            mantenerte al día y hazles saber que lo que ocurre en el Congreso te
            afecta y te importa.
          </p>

          <h2>Reconoce las buenas prácticas</h2>
          <p>
            Del mismo modo, cuando nuestros diputados y diputadas hacen bien su
            trabajo se lo debemos de reconocer. Escríbeles un correo electrónico
            o menciónales en redes sociales para que sus buenas prácticas tengan
            un reconocimiento público. No sólo servirá para animarles a
            continuar su labor, sino que puede ayudar a aumentar el perfil y la
            influencia dentro de sus partidos de aquellos representantes que
            verdaderamente lo merecen.
          </p>

          <h2>Construye con nosotras... ¿Cómo?</h2>
          <ul>
            <li>
              <b>Propón un tema para la editorial semanal:</b> cada semana
              dedicamos un espacio en la web de la herramienta para visibilizar
              la actividad parlamentaria vinculada con alguna temática
              interesante, relevante y de actualidad. Si tienes alguna que te
              gustaría visibilizar no dudes en escribirnos a
              <a href="mailto:qhld@politicalwatch.es" target="_blank"
                >qhld@politicalwatch.es</a
              >
            </li>
            <li>
              <b
                >Ayúdanos a ampliar las temáticas a las que damos
                seguimiento:</b
              >
              a día de hoy QHLD da seguimiento a
              <router-link :to="{ name: 'topics' }">24 temáticas</router-link>
              que van desde cuestiones clásicas (como Educación o Sanidad) a
              otras más novedosas (como Derechos digitales o Colectivo LGTBI).
              ¿Echas en falta alguna temática a la que quisieras que diésemos
              seguimiento parlamentario? Escríbenos a qhld@politicalwatch.es y
              buscaremos la forma de llevarla a cabo.
            </li>
            <li>
              <b>Mejora el código fuente:</b> todo el código informático que
              sustenta la herramienta de QHLD está basado en software libre y
              disponible en nuestro Github. Si eres programador/a, diseñador/a,
              experto/a en experiencia de usuario o gestor/a de contenidos y
              crees que puedes aportar al proyecto, no dudes en escribirnos a
              <a href="mailto:qhld@politicalwatch.es" target="_blank"
                >qhld@politicalwatch.es</a
              >
            </li>
          </ul>
          <p></p>

          <h2 id="dona">
            Dona y contribuye con el mantenimiento de la herramienta
          </h2>
          <p>
            Qué Hacen Los Diputados se mantiene exclusivamente con fondos
            propios de
            <a href="https://politicalwatch.es" target="_blank"
              >Political Watch</a
            >
            (el think-and-do tank de la Fundación Salvador Soler). Vigilar la
            actividad del Congreso de los Diputados no es una tarea fácil (350
            diputados y diputadas, una treintena de Comisiones, más de 25.000
            iniciativas parlamentarias al año…) y el mantenimiento del proyecto
            implica unos considerables recursos económicos y humanos. Gracias a
            pequeñas aportaciones de nuestra comunidad de personas usuarias
            podremos seguir ofreciendo y mejorando la herramienta. Entendemos el
            seguimiento parlamentario como un servicio público. ¿Nos ayudas a
            mantenerlo?
            <b
              >Haznos un Bizum al código 02841 con el concepto QHLD o Qué Hacen
              Los Diputados</b
            >.
          </p>
          <img
            src="/img/haznosunbizum.png"
            width="400px"
            height="400px"
            alt="En esta imagen aparece el código CIECODE para que nos podáis hacer un Bizum"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'collaborate' });
import PageHeader from "@/components/PageHeader.vue";
</script>

<style scoped lang="scss"></style>
