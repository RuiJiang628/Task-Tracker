<template>
  <div class="task-tracker-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <h1>Task Tracker</h1>
    </aside>

    <!-- Main content area -->
    <div class="main-content">
      <button class="sign-out-button" @click="logout">
        Sign out
        <span class="icon-logout"></span>
        <form method="POST" action="/api/logout" id="logoutForm" />
      </button>
      <!-- Greeting Section -->
      <div class="greeting-section">
        <h2>Hello, Admin!</h2>
        <p></p>
        <span class="date">Monday, 18 December 2023</span>
      </div>

      <section class="task-section">
        <header class="task-header">
          <h2>Users</h2>
        </header>

        <!-- <div class="task-list">
          <div></div>
        </div> -->
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from "vue";
import { User } from "../data";
import { io } from "socket.io-client";

const socket = io(); // 使用你的Socket.IO服务器地址

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}

const user = ref({} as User);
provide("user", user);

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json();
});
</script>

<style scoped lang="scss" , src="../assets/styles/Dashboard.scss"></style>
