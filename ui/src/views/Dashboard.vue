<template>
  <Dashboard>
    <template v-slot:header>
      <button class="profile-button"></button>
        <!-- Sign out button -->
        <button
        class="sign-out-button"
        @click="logout"
      >
        Sign out
        <span class="icon-logout"></span>
      </button>
    </template>
  </Dashboard>
</template>


<script setup lang = "ts">
  import Dashboard from './../components/Dashboard.vue'
</script>

<style scoped lang='scss', src="../assets/styles/Dashboard.scss"></style>