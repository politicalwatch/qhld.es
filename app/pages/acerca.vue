<template>
  <div>
    <div id="about" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid">
        <div class="o-grid__col u-12 u-4@sm">
          <page-header title="Acerca" />
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <h3 class="u-uppercase">
            Acortando distancias entre la ciudadanía y sus representantes
            políticos en el congreso de los diputados de España desde 2011.
          </h3>
          <h2>Orígenes</h2>
          <p>
            <b>Qué Hacen Los Diputados (QHLD)</b> es un proyecto que nace en
            2011 de la mano de un equipo multidisciplinar de desarrolladores y
            periodistas. En sus inicios, la motivación del proyecto era “ayudar
            a saber qué hacen los actuales representantes políticos'' brindando
            información a la ciudadanía de manera sencilla para que “pudieran
            implicarse en el proceso legislativo”. Sin embargo, el proyecto
            quedó inactivo en 2018 debido a otros compromisos de su equipo
            promotor.
          </p>
          <h2>Renovación de QHLD</h2>
          <p>
            A principios de 2021,
            <a href="https://politicalwatch.es">Political Watch</a> se reunió
            con sus fundadoras para ofrecerse a la reactivación de QHLD. El
            alineamiento resultó inmediato, ya que desde nuestro think-and-do
            tank también hemos trabajado por más de 10 años herramientas de
            seguimiento parlamentario como Proyecto Avizor, TIPI Ciudadano o
            Parlamento 2030. En dicha reunión se cedieron los derechos y el
            nombre del proyecto a Political Watch, que a su vez decidió unificar
            toda la experiencia del proyecto previo a las innovaciones
            realizadas en sus herramientas de seguimiento parlamentario y así
            lanzar esta nueva plataforma mejorada de QHLD. La misma contiene lo
            mejor de sus versiones previas y muchas funcionalidades más para
            cumplir con sus objetivos de promoción de la rendición de cuentas
            del parlamento y sus parlamentarios y con ella acortando las
            distancias entre la ciudadanía y sus representantes políticos.
          </p>
          <h2>Motivaciones</h2>
          <p>
            El proyecto pretende responder a una serie de cuestionamientos en
            relación con el trabajo de las y los diputados en el Congreso:
          </p>
          <ul>
            <li>¿Cómo votan las y los diputados?</li>
            <li>
              ¿Qué se está haciendo en relación con el control y la orientación
              al Gobierno?
            </li>
            <li>¿Qué leyes se están debatiendo en este momento?</li>
            <li>¿Qué tipos de iniciativas son las más comunes?</li>
            <li>
              ¿Cómo contribuyen las iniciativas en marcha a luchar contra las
              problemáticas sociales, económicas y medioambientales?
            </li>
            <li>
              ¿Quiénes son las y los diputados más activos o influyentes en
              diferentes temáticas?
            </li>
            <li>
              ¿Cuáles son las temáticas más impulsadas por cada grupo
              parlamentario?
            </li>
            <li>¿Cómo se están tratando ciertos temas en la Cámara?</li>
          </ul>
          <h2>Metodología</h2>
          <p>
            El objetivo de este proyecto es recopilar toda la información sobre
            las iniciativas parlamentarias lo más objetivamente posible. Eso
            incluye tanto información positiva como negativa sobre derechos
            humanos y grupos vulnerables. De esta manera, la herramienta permite
            tanto identificar propuestas de avance social como detectar
            discursos de odio.
          </p>
          <p>
            Las etiquetas actuales se han creado con la participación de
            entidades de referencia en los temas a analizar. Muchas de estas
            etiquetas no afectan solo a un colectivo -por ejemplo, la
            información sobre ETS no afecta solo a la comunidad LGTBI-, pero
            seguir cuando se mencionan juntas facilita detectar intentos de
            estigmatización en posibles iniciativaspropuestas parlamentarias.
          </p>
          <h2>Objetivos</h2>
          <ul>
            <li>
              Ofrecer información a la ciudadanía acerca de lo que se hace en el
              Congreso para generar un incentivo para que los representantes
              públicos se comprometan con el desarrollo sostenible, la justicia
              social y la calidad democrática.
            </li>
            <li>
              Ofrecer a todos los stakeholders la mejor información sobre la
              actividad parlamentaria, para facilitar su participación e
              influencia en los procesos de decisión política.
            </li>
            <li>
              Acercar a representantes y representados mostrando todo lo que en
              el Congreso se hace para responder a las necesidades y
              preocupaciones de la población.
            </li>
          </ul>
          <h2>Tecnología</h2>
          <p>
            La tecnología de QHLD escanea toda la actividad parlamentaria del
            Congreso de España y la clasifica automáticamente según su relación
            con alguna de las {{ allTopics.length }} temáticas prioritarias para
            la pobreza, la justicia social y el desarrollo sostenible y con
            alguno de los 17 Objetivos de Desarrollo Sostenible de las Naciones
            Unidas. Todas estas
            <router-link :to="{ name: 'topics' }">áreas temáticas</router-link>
            han sido diseñadas junto con personas y organizaciones expertas en
            cada una de ellas.
          </p>
          <p>
            La plataforma digital dispone de un buscador con el que la persona
            usuaria puede afinar su búsqueda en base a múltiples criterios
            (autor, fecha, tema, palabra clave, etc).
          </p>
          <p>
            Además ofrece un sistema personalizado de alertas que permite a la
            persona usuaria estar al día sobre las novedades parlamentarias de
            sus temáticas de interés.
          </p>
          <h2>Reutilización</h2>
          <p>
            QHLD permite el acceso y descarga libre de toda la información
            disponible a través de la misma web en formato reutilizable
            Excel/CSV o a través de su
            <a href="https://api.quehacenlosdiputados.es">API</a> en formato
            JSON.
          </p>
          <p>
            Además, todo el código informático del proyecto está disponible en
            <a href="https://github.com/politicalwatch/"
              >la página de Github de Political Watch</a
            >.
          </p>
          <p>
            Si usas el código de QHLD para un nuevo proyecto o la información
            que generamos en tus investigaciones,
            <a
              href="mailto:qhld@politicalwatch.es?subject=Contacto+a+través+de+qhld.es"
              >avísanos</a
            >, nos encantará saberlo. Puedes citarnos como: Qué Hacen Los
            Diputados. (2022). [HTML]. Political Watch - Fundación Salvador
            Soler.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'about' });
useSeoMeta({
  title: 'Acerca de',
  ogTitle: 'Acerca de',
  ogType: 'website',
});
import PageHeader from "@/components/PageHeader.vue";

const { data: allTopics } = await useTopics();
</script>

<style scoped lang="scss">
ul + h2 {
  margin-top: 2rem;
}
</style>
