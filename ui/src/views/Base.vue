<template>
  <router-view />
  <Dashboard>
    <template v-slot:header>
      <button class="sign-out-button" @click="handleLogin">
        Sign in
      </button>
    </template>
    <template v-slot:greeting>
      <h2>Hello, visitor!</h2>
      <p>Please sign in first.</p>
    </template>
  </Dashboard>
</template>

<script setup lang="ts">
import Dashboard from './../components/Dashboard.vue';

const handleLogin = () => {
  window.location.href = "/api/login";
};

</script>

<style scoped lang='scss' src="../assets/styles/Dashboard.scss"></style>
