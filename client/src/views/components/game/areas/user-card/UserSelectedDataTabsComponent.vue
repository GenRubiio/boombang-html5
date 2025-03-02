<template>
  <InteractionsTabComponent />
</template>

<script>
import InteractionsTabComponent from "./tabs/InteractionsTabComponent.vue";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {},
  computed: {},
  components: {
    InteractionsTabComponent,
  },
};
</script>

<style scoped></style>
