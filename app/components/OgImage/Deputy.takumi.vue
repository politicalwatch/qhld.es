<template>
  <!--
    Props: name, image, party, partyColor, constituency, footprint
  -->
  <div
    style="display:flex; flex-direction:column; width:1200px; height:600px; background-color:#ffffff; font-family:Rubik, sans-serif;"
  >
    <!-- Coloured top bar (party colour) -->
    <div
      :style="`width:1200px; height:12px; background-color:${partyColor || '#efca53'}; flex-shrink:0;`"
    />

    <!-- Main area -->
    <div style="display:flex; flex:1; align-items:center; padding:48px 72px; gap:60px;">
      <!-- Deputy photo -->
      <div style="flex-shrink:0;">
        <img
          :src="image"
          width="200"
          height="200"
          style="border-radius:50%; object-fit:cover;"
          :style="`border:8px solid ${partyColor || '#efca53'};`"
        />
      </div>

      <!-- Text info -->
      <div style="display:flex; flex-direction:column; flex:1; gap:18px;">
        <!-- QHLD logo (native 160×98) -->
        <img src="/img/logo.svg" width="160" height="98" />

        <!-- Name -->
        <div
          style="font-family:'Fjalla One', sans-serif; font-size:52px; font-weight:400; color:#2d4252; line-height:1.05; text-transform:uppercase;"
        >
          {{ name }}
        </div>

        <!-- Single meta line: party · constituency · footprint -->
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:16px;">
          <!-- Party -->
          <div
            :style="`font-size:22px; font-weight:500; color:${partyColor || '#efca53'}; line-height:1.2;`"
          >
            {{ party }}
          </div>

          <!-- Divider -->
          <div v-if="constituency" style="width:1px; height:22px; background-color:#e3e8ec; flex-shrink:0;" />

          <!-- Constituency with map-marker icon -->
          <div v-if="constituency" style="display:flex; align-items:center; gap:6px;">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              style="flex-shrink:0;"
            >
              <path
                fill="#8095a0"
                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7"
              />
            </svg>
            <div style="font-size:20px; color:#8095a0;">{{ constituency }}</div>
          </div>

          <!-- Divider -->
          <div v-if="footprint" style="width:1px; height:22px; background-color:#e3e8ec; flex-shrink:0;" />

          <!-- Footprint with bar-chart icon -->
          <div v-if="footprint" style="display:flex; align-items:center; gap:6px;">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              style="flex-shrink:0;"
            >
              <path
                fill="#8095a0"
                d="M3 22V8h4v14zm7 0V2h4v20zm7 0v-8h4v8z"
              />
            </svg>
            <div style="font-size:20px; color:#8095a0;">Índice parlamentario</div>
            <div
              style="font-family:'Fjalla One', sans-serif; font-size:24px; color:#8095a0;"
            >
              {{ footprint }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      style="display:flex; align-items:center; justify-content:flex-end; padding:16px 60px; border-top:1px solid #e3e8ec;"
    >
      <div style="font-size:16px; color:#8095a0;">quehacenlosdiputados.es</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, default: '' },
  image: { type: String, default: '' },
  party: { type: String, default: '' },
  partyColor: { type: String, default: '#efca53' },
  constituency: { type: String, default: '' },
  footprint: { type: Number, default: 0 },
});
</script>
