<template>
  <router-view />
  <Dashboard>
    <template v-slot:header>
      <!-- 登录按钮 -->
      <button class="sign-out-button" @click="handleLogin">
        Sign in
      </button>
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
