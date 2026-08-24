<template>
  <div>
    <div id="footprint" class="o-container o-section u-margin-bottom-10">
      <div class="o-grid">
        <div class="o-grid__col u-12 u-4@sm">
          <page-header title="Índice parlamentario" />
        </div>
        <div class="o-grid__col u-12 u-8@sm">
          <h3 class="u-uppercase">
            Es un indicador basado en el volumen de actividad de cada diputado o
            diputada, en su capacidad para sacar adelante propuestas y en su
            cercanía a la ciudadanía.
          </h3>
          <p>
            El índice parlamentario es el reflejo de la actividad de un diputado
            o diputada. A mayor índice, consideramos que su trabajo
            parlamentario es más relevante. Para calcularla, combinamos 4
            factores:
          </p>
          <div class="footprint__factors">
            <div>
              <img src="/img/footprint-volumen.png" />
              <h4>Volumen de actividad</h4>
              <p>
                La cantidad de iniciativas que presenta, dando más peso a las
                más elaboradas. Por ejemplo, suma más puntos una Proposición No
                de Ley que una pregunta oral.
              </p>
            </div>
            <div>
              <img src="/img/footprint-efectividad.png" />
              <h4>Efectividad</h4>
              <p>
                La efectividad de sus propuestas y su capacidad para alcanzar
                consensos en torno a ellas.
              </p>
            </div>
            <div>
              <img src="/img/footprint-accesibilidad.png" />
              <h4>Cercanía</h4>
              <p>
                La facilidad de contacto con el parlamentario/a (valoramos si
                tiene un correo electrónico directo y publicado de forma
                visible, si cuenta con redes sociales…).
              </p>
            </div>
            <div>
              <img src="/img/footprint-inactividad.png" />
              <h4>Tiempo de inactividad</h4>
              <p>
                La frecuencia de su actividad: a más inactividad, más
                penalización.
              </p>
            </div>
          </div>
          <h2>El algoritmo</h2>
          <p>
            Este índice parlamentario está construido en base a
            diferentes variables que permiten medir y comparar la actividad e
            influencia de los diputados y diputadas tanto a nivel general como
            en las diferentes
            <router-link :to="{ name: 'topics' }">temáticas</router-link> a las
            que da seguimiento QHLD.
          </p>
          <p>
            Se trata de un indicador que se actualiza semanalmente
            (todos los domingos) para cada uno de los miembros del Congreso de
            los Diputados y además para cada una de las temáticas.
          </p>
          <p>
            El indicador se calcula, para cada diputado o diputada, a partir de
            las siguientes variables:
          </p>
          <ul>
            <li>
              Número de iniciativas presentadas desde el inicio de la
              legislatura, ponderado por cada tipo de iniciativa.
            </li>
            <li>
              Número de Proposiciones de Ley y Proposiciones No de Ley aprobadas
              de entre las presentadas por cada miembro del Congreso en cada
              temática.
            </li>
            <li>
              Existencia o no de una cuenta de correo electrónico pública.
            </li>
            <li>
              Existencia o no de redes sociales públicas.
            </li>
            <li>
              Número de meses transcurridos desde la última iniciativa
              presentada.
            </li>
          </ul>
          <p>A partir de esas variables se pretende medir:</p>
          <ul>
            <li>
              El volumen de actividad de cada diputado o diputada y su
              efectividad en cuanto a la aprobación de las iniciativas.
            </li>
            <li>La accesibilidad de los y las diputadas ante la ciudadanía.</li>
            <li>
              La constancia del diputado o diputada en el debate parlamentario.
            </li>
          </ul>
          <p>Para calcular el índice se han definido 3 fases diferenciadas:</p>

          <h3>
            Fase 1: Cálculo del volumen de actividad y efectividad parlamentaria
          </h3>
          <p>
            En esta primera fase, se toma el total de iniciativas presentadas
            (menos las retiradas y las no admitidas a trámite) por cada
            diputado/a y además para cada una de las temáticas. Esta cantidad se
            pondera en función de los tipos de iniciativas presentadas. Cada
            tipo de iniciativa tiene un peso diferente en función de su
            relevancia política dentro de la actividad del Congreso de los
            Diputados, así como a la dedicación que implica su elaboración. Los
            pesos, son los siguientes:
          </p>
          <responsive-table :columns="weights.columns" :rows="weights.rows" />

          <p>
          Además, para calcular la puntuación que le corresponde a cada diputada/o, se tiene en cuenta el número de personas firmantes de cada iniciativas. Con esto conseguimos un reparto equitativo.
          </p>

          <div class="example">
            <h5 class="u-uppercase">Ejemplo</h5>
            <p>
              Así al aplicar este primer cálculo, una diputada obtendría un
              índice parlamentario de 190 tras haber presentado las siguientes
              iniciativas:
            </p>
            <ul>
              <li>3 preguntas orales en el pleno.</li>
              <li>2 Proposiciones no de Ley en Comisión.</li>
              <li>1 Proposición de Ley de Grupos Parlamentarios.</li>
            </ul>
          </div>

          <p>
            El siguiente paso es valorar la efectividad, para lo que se revisa
            cuántas de las Proposiciones No de Ley y las Proposiciones de Ley
            presentadas por el diputado/a analizado han sido aprobadas. Cada una
            de ellas recibe una puntuación extra en base a los siguientes
            cálculos:
          </p>

          <responsive-table :columns="details.columns" :rows="details.rows" />

          <div class="example">
            <h5 class="u-uppercase">Ejemplo</h5>
            <p>
              Así, la diputada obtendría 25 puntos extra y su índice se elevaría
              a 270, si tuviera:
            </p>
            <ul>
              <li>1 Proposición No de Ley en Comisión aprobada.</li>
              <li>1 Proposición de Ley de Grupos Parlamentarios aprobada</li>
            </ul>
          </div>

          <p>
            Si el resultado del cálculo de la Fase 1 es mayor que cero, se
            procede a las Fases 2 y 3. En cambio, si este valor es de 0, se
            entiende que el diputado o diputada no cuenta aún con actividad
            parlamentaria y por tanto su índice es de cero. En este sentido, las
            variables de las fases 2 y 3 están condicionadas a que exista una
            actividad parlamentaria ya en marcha.
          </p>

          <h3>Fase 2: Accesibilidad</h3>
          <p>
            En esta segunda fase, a la puntuación del índice ya obtenida se
            sumarán los siguientes puntos en función de dos variables:
          </p>
          <table>
            <tbody>
              <tr>
                <td><b>Redes Sociales</b></td>
                <td>¿Tiene redes sociales públicas?</td>
                <td>
                  Dos valores posibles:<br />
                  0: no tiene redes<br />
                  40: tiene redes<br />
                  El puntaje es el equivalente a 1 Proposición de Ley
                </td>
              </tr>
              <tr>
                <td><b>Correo de contacto</b></td>
                <td>¿Tiene un correo de contacto?</td>
                <td>
                  Dos valores posibles:<br />
                  0: no tiene correo<br />
                  40: tiene correo<br />
                  El puntaje es el equivalente a 1 Proposición de Ley
                </td>
              </tr>
            </tbody>
          </table>

          <div class="example">
            <h5 class="u-uppercase">Ejemplo</h5>
            <p>
              El índice de la diputada anterior ascendería a 350 si tuviera
              tanto una cuenta de Twitter como un correo electrónico público.
            </p>
          </div>

          <h3>Fase 3: Tiempo de inactividad</h3>
          <p>
            El último paso antes de obtener el puntaje final del índice es
            verificar el tiempo de inactividad de cada uno de los diputados y
            diputadas en cada una de las temáticas. Se entiende por inactividad
            el periodo en el cual no se ha presentado ningún tipo de iniciativa puntuable.
          </p>
          <p>
            En función de la cantidad de meses que lleve inactivo el diputado o
            diputada, se le penalizará con una reducción en su puntuación total
            de entre el 10 y el 50%, de acuerdo a las siguientes condiciones:
          </p>
          <ul>
            <li>Inactivo entre 3 y 6 meses: 10% de reducción de su índice.</li>
            <li>Inactivo entre 6 y 12 meses: 25% de reducción de su índice.</li>
            <li>
              Inactivo por más de 12 meses: 50% de reducción de su índice.
            </li>
          </ul>

          <div class="example">
            <h5 class="u-uppercase">Ejemplo</h5>
            <p>
              Finalmente, suponiendo que la diputada llevara inactiva 7 meses,
              su índice parlamentario pasaría de 351 a 262.5.
            </p>
          </div>

          <h3>
            Fase final: Normalización
          </h3>
          <p>
          Por último, el valor obtenido en cada una de las fases anteriores para cada diputado/a o grupo parlamentario se expresa en forma de porcentaje. De este modo, en el índice, el valor de un diputado/a o grupo se calcula tomando como el máximo el del diputado/a o grupo con mayor puntuación.
          </p>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ name: 'footprint' });
useSeoMeta({
  title: 'Índice de actividad parlamentaria',
  ogTitle: 'Índice de actividad parlamentaria',
  ogType: 'website',
});
import PageHeader from "@/components/PageHeader.vue";
import ResponsiveTable from "@/components/ResponsiveTable.vue";

const weights = {
  columns: ["Categoría", "Subcategoría", "Peso"],
  rows: [
    ["Iniciativas de Control", "Pregunta oral en Pleno", "10"],
    ["Iniciativas de Control", "Pregunta oral al Gobierno en Comisión", "10"],
    [
      "Iniciativas de Control",
      "Comparecencia del Gobierno en Comisión (art. 44)",
      "4",
    ],
    [
      "Iniciativas de Control",
      "Comparecendia del Gobierno en Comisión (arts. 202 y 203)",
      "4",
    ],
    [
      "Iniciativas de Control",
      "Comparecencia de autoridades y funcionarios en Comisión",
      "4",
    ],
    [
      "Iniciativas de Control",
      "Comparec. autoridades y funcionarios en Com. Mx. solicitada en Senado",
      "4",
    ],
    ["Iniciativas de Control", "Otras comparecencias en Comisión", "4"],
    ["Iniciativas de Control", "Moción de censura", "10"],
    ["Iniciativas de Control", "Interpelación urgente", "4"],
    ["Iniciativas de Control", "Interpelación ordinaria", "4"],
    ["Iniciativas de Control", "Pregunta oral a la Corporación RTVE", "10"],
    [
      "Iniciativas de Control",
      "Solicitud de informe a la Administración del Estado (art. 7)",
      "4",
    ],
    [
      "Iniciativas de Control",
      "Solicitud de informe a otra Entidad Pública (art. 7)",
      "4",
    ],
    [
      "Iniciativas de Control",
      "Solicitud de informe a la Administración del Estado (art. 44)",
      "4",
    ],
    [
      "Iniciativas de Control",
      "Solicitud de informe a otra Entidad Pública (art. 44)",
      "4",
    ],
    ["Iniciativas de Control", "Otras solicitudes de informe (art. 44)", "4"],
    ["Iniciativas de orientación", "Proposición no de Ley ante el Pleno", "40"],
    ["Iniciativas de orientación", "Proposición no de Ley en Comisión", "40"],
    [
      "Iniciativas de orientación",
      "Moción consecuencia de interpelación ordinaria",
      "40",
    ],
    [
      "Iniciativas de orientación",
      "Moción consecuencia de interpelación urgente",
      "40",
    ],
    [
      "Iniciativas de legislativas",
      "Proposición de ley de Grupos Parlamentarios del Congreso",
      "80",
    ],
    ["Iniciativas de legislativas", "Proposición de ley de Diputados", "80"],
    ["Iniciativas de legislativas", "Proyecto de reforma Constitucional", "80"],
    [
      "Iniciativas de legislativas",
      "Proposición de reforma Constitucional de Grupos Parlamentarios",
      "80",
    ],
    [
      "Iniciativas de legislativas",
      "Proposición de reforma constitucional de Comunidades Autónomas",
      "80",
    ],
  ],
};
const details = {
  columns: ["Categoría", "Tipo de iniciativa", "Peso", "Detalle"],
  rows: [
    [
      "Iniciativas de orientación",
      "Aprobación de Proposición no de Ley ante el Pleno",
      "20 puntos extra",
      "50% adicional sobre el peso de la iniciativa",
    ],
    [
      "Iniciativas de orientación",
      "Aprobación de Proposición no de Ley en Comisión",
      "20 puntos extra",
      "50% adicional sobre el peso de la iniciativa",
    ],
    [
      "Iniciativas legislativas",
      "Aprobación de Proposición de ley de Grupos Parlamentarios del Congreso",
      "60 puntos extra",
      "75% adicional sobre el peso de la iniciativa",
    ],
    [
      "Iniciativas legislativaS",
      "Aprobación de Proposición de ley de Diputados",
      "60 puntos extra",
      "75% adicional sobre el peso de la iniciativa",
    ],
  ],
};
</script>

<style scoped lang="scss">
thead {
  position: sticky;
  top: 0;
}
.example {
  background-color: #f3f3f3;
  padding: 32px;
  border-radius: 6px;
  border: solid 4px #1d1d1b;
  margin-top: 32px;
  margin-bottom: 32px;
}

.footprint {
  &__factors {
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr;
    margin-bottom: 4rem;

    @media (min-width: $md) {
      grid-template-columns: 1fr 1fr;
    }

    div {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      background: $lightgrey;
      border-radius: 16px;

      img {
        max-width: 80%;
        margin-bottom: 2rem;
      }
      h4 {
        font-size: 1.5rem;
        line-height: 1.5;
        font-size: 1.5rem;
        line-height: 1.5;
        margin-top: 0;
        margin-bottom: 1rem;
      }
      p {
        margin-top: 0;
        line-height: 1.5;
      }
    }
  }
}
</style>
