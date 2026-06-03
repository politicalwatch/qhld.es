<template>
  <!--
    Props: name, groupId, deputyCount, groupColor
  -->
  <div
    style="display:flex; flex-direction:column; width:1200px; height:600px; background-color:#ffffff; font-family:Rubik, sans-serif;"
  >
    <!-- Coloured top bar (group colour, supports gradient) -->
    <div
      :style="`width:1200px; height:12px; background-color:${borderColor}; flex-shrink:0;`"
    />

    <!-- Main area -->
    <div style="display:flex; flex:1; align-items:center; padding:48px 80px; gap:64px;">
      <!-- Group logo — circle clipped directly on the img (like Deputy photo) -->
      <img
        :src="`/assets/gp/${groupId}.png`"
        width="180"
        height="180"
        style="flex-shrink:0; border-radius:50%; object-fit:contain; background-color:#f4f6f8;"
      />

      <!-- Text info -->
      <div style="display:flex; flex-direction:column; flex:1; gap:20px;">
        <!-- QHLD logo -->
        <img src="/img/logo.svg" width="160" height="98" />

        <!-- Group name -->
        <div
          style="font-family:'Fjalla One', sans-serif; font-size:44px; font-weight:400; color:#2d4252; line-height:1.05; text-transform:uppercase;"
        >
          {{ name }}
        </div>

        <!-- Deputy count -->
        <div
          v-if="deputyCount"
          style="display:flex; align-items:center; gap:10px;"
        >
          <div
            style="font-family:'Fjalla One', sans-serif; font-size:36px; color:#8095a0;"
          >
            {{ deputyCount }}
          </div>
          <div style="font-size:20px; color:#8095a0;">diputados/as</div>
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
const props = defineProps({
  name: { type: String, default: '' },
  groupId: { type: String, default: '' },
  deputyCount: { type: Number, default: 0 },
  groupColor: { type: String, default: '#ff6565' },
});

// CSS borders don't support gradients — fall back to coral for gradient group colors
const borderColor = computed(() =>
  props.groupColor?.startsWith('#') ? props.groupColor : '#ff6565'
);
</script>
