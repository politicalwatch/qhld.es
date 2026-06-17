<template>
  <!--
    Props: title, initiativeType, reference, date, status
  -->
  <div
    style="display:flex; flex-direction:column; width:1200px; height:600px; background-color:#ffffff; font-family:Rubik, sans-serif;"
  >
    <!-- Yellow top bar -->
    <div style="width:1200px; height:12px; background-color:#efca53; flex-shrink:0;" />

    <!-- Main area -->
    <div style="display:flex; flex:1; flex-direction:column; padding:44px 80px; gap:20px;">
      <!-- Logo + type badge row -->
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <img src="/img/logo.svg" width="100" height="61" />
        <div
          v-if="initiativeType"
          style="display:inline-flex; padding:8px 20px; background-color:#ff6565; font-size:15px; font-weight:500; color:#ffffff; text-transform:uppercase; letter-spacing:1px;"
        >
          {{ initiativeType }}
        </div>
      </div>

      <!-- Title -->
      <div
        style="font-family:'Fjalla One', sans-serif; font-size:44px; font-weight:400; color:#2d4252; line-height:1.15; text-transform:uppercase; max-width:1000px; flex:1; display:flex; align-items:center;"
      >
        {{ truncatedTitle }}
      </div>

      <!-- Meta row -->
      <div style="display:flex; gap:24px; align-items:center; flex-wrap:wrap;">
        <div v-if="reference" style="display:flex; gap:8px; align-items:center;">
          <div style="font-size:13px; color:#8095a0; text-transform:uppercase; letter-spacing:1px;">Ref.</div>
          <div style="font-size:17px; color:#2d4252; font-weight:500;">{{ reference }}</div>
        </div>
        <div v-if="date" style="display:flex; gap:8px; align-items:center;">
          <div style="font-size:13px; color:#8095a0; text-transform:uppercase; letter-spacing:1px;">Registro</div>
          <div style="font-size:17px; color:#2d4252;">{{ date }}</div>
        </div>
        <div
          v-if="status"
          style="padding:6px 16px; background-color:#f4f6f8; font-size:15px; color:#2d4252; border-left:3px solid #efca53;"
        >
          {{ status }}
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
  title: { type: String, default: '' },
  initiativeType: { type: String, default: '' },
  reference: { type: String, default: '' },
  date: { type: String, default: '' },
  status: { type: String, default: '' },
});

const truncatedTitle = computed(() =>
  props.title && props.title.length > 120
    ? props.title.slice(0, 117) + '...'
    : props.title
);
</script>
