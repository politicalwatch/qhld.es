<template>
  <!--
    Props: name, description, topicId, topicColor
  -->
  <div
    style="display:flex; flex-direction:column; width:1200px; height:600px; background-color:#ffffff; font-family:Rubik, sans-serif;"
  >
    <!-- Coloured top bar (topic colour) -->
    <div
      :style="`width:1200px; height:12px; background-color:${topicColor || '#A3D5C8'}; flex-shrink:0;`"
    />

    <!-- Main area: two-column when photo available, full-width otherwise -->
    <div style="display:flex; flex:1; overflow:hidden;">
      <!-- Left column: content -->
      <div
        style="display:flex; flex-direction:column; flex:1; padding:44px 64px; gap:16px;"
      >
        <!-- Logo -->
        <img src="/img/logo.svg" width="160" height="98" style="margin-bottom:4px;" />

        <!-- "Temática" badge -->
        <div
          style="display:inline-flex; align-self:flex-start; padding:7px 18px; background-color:#A3D5C8; font-size:14px; font-weight:500; color:#ffffff; text-transform:uppercase; letter-spacing:2px;"
        >
          Temática
        </div>

        <!-- Topic name -->
        <div
          style="font-family:'Fjalla One', sans-serif; font-size:58px; font-weight:400; color:#2d4252; text-transform:uppercase; line-height:1.05; flex:1; display:flex; align-items:center;"
        >
          {{ name }}
        </div>

        <!-- Description -->
        <div
          v-if="description"
          style="font-size:18px; color:#8095a0; line-height:1.4; max-width:560px;"
        >
          {{ description }}
        </div>
      </div>

      <!-- Right column: topic photo (when available) -->
      <div
        v-if="topicId"
        style="flex-shrink:0; width:420px; position:relative; overflow:hidden;"
      >
        <img
          :src="`/assets/topics/${topicId}.jpg`"
          width="420"
          height="600"
          style="width:420px; height:600px; object-fit:cover; display:block;"
        />
        <!-- Subtle topicColor tint overlay -->
        <div
          :style="`position:absolute; top:0; left:0; width:420px; height:600px; background-color:${topicColor || '#A3D5C8'}; opacity:0.15;`"
        />
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
  description: { type: String, default: '' },
  topicId: { type: String, default: '' },
  topicColor: { type: String, default: '#A3D5C8' },
});
</script>
