<template>
  <div class="lobby__scenes-tab">
    <div class="lobby__scenes-list">
      <p>{{ $t('lobby.search.not_implemented') }}</p>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.lobby__scenes-list {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
p {
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 14px;
}
</style>
