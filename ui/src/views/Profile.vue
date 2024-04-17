<template>
    <div class="task-tracker-container">
      <!-- Left Sidebar -->
      <aside class="sidebar">
        <h1>Task Tracker</h1>
      </aside>
  
      <!-- Right Main Content Area -->
      <div class="main-content">
        <!-- Top Bar with Sign Out -->
        <div class="top-bar">
        <!-- Return Button -->
        <button class="button return-button" @click="goBack">
          Return
          <span class="icon-return"></span>   
        </button>

        <!-- Sign Out Button -->
        <button class="button sign-out-button" @click="logout">
          Sign out
          <span class="icon-logout"></span>
          <form method="POST" action="/api/logout" id="logoutForm" />  
        </button>
      </div>
  
    <!-- Edit Profile Section -->
    <div class="edit-profile">
    <h2>Edit profile</h2>
    <form @submit.prevent="submitForm">
        <!-- User Name Field -->
        <div class="input-group">
        <label for="username">User Name</label>
        <input id="username" type="text" v-model="user.userName">
        </div>

        <!-- Email Field -->
        <div class="input-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="user.email">
        </div>

        <div class="input-group">
          <label for="gender">Gender</label>
          <select id="gender" v-model="user.gender">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Birthday Field -->
        <div class="input-group">
          <label for="birthday">Birthday</label>
          <input id="birthday" type="date" v-model="user.birthday">
        </div>

        <!-- Buttons -->
        <div class="actions">
            <button type="cancel" class="button cancel-button">Cancel</button>
          <button type="submit" class="button save-button">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">

  import { onMounted, ref, provide } from 'vue'
  import { User } from '../data'
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const user = ref({} as User)
  provide("user", user)

  onMounted(async () => {
    user.value = await (await fetch("/api/user")).json()
  })

  const goBack = () => {
  router.go(-1); // 这将模拟浏览器的后退按钮
  };

  function logout() {
  ;(window.document.getElementById('logoutForm') as HTMLFormElement).submit()  
  }

</script>
  
<style scoped lang='scss', src="../assets/styles/Profile.scss"></style>
  