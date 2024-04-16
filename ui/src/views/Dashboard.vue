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
      <form method="POST" action="/api/logout" id="logoutForm" />
    </template>
  </Dashboard>
</template>


<script setup lang = "ts">
  import Dashboard from './../components/Dashboard.vue'

  function logout() {
  ;(window.document.getElementById('logoutForm') as HTMLFormElement).submit()  
  }
</script>

<style scoped lang='scss', src="../assets/styles/Dashboard.scss"></style>