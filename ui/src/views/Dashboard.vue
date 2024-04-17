<template>
  <Dashboard>
    <template v-slot:header>
      <button class="profile-button" @click="profile"></button>
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
    <template v-slot:greeting>
      <h2>Hello, {{ user.userName }}!</h2>
    </template>
  </Dashboard>
</template>


<script setup lang = "ts">
  import { onMounted, ref, provide } from 'vue'
  import { User } from '../data'
  import { io } from 'socket.io-client';

  import Dashboard from './../components/Dashboard.vue'

  const socket = io(); // 使用你的Socket.IO服务器地址

  function logout() {
  ;(window.document.getElementById('logoutForm') as HTMLFormElement).submit()  
  }

  const profile = () => {
  window.location.href = "/profile"
  }

  const user = ref({} as User)
  provide("user", user)

  onMounted(async () => {
    user.value = await (await fetch("/api/user")).json()
  })

</script>

<style scoped lang='scss', src="../assets/styles/Dashboard.scss"></style>