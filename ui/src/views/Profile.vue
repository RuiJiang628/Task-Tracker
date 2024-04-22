<template>
  <div class="task-tracker-container">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <a href="/dashboard">
        <h1>Task Tracker</h1>
      </a>
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
            <input id="username" type="text" v-model="user.userName" />
            <span v-if="errors.userNameError" class="error-message">{{
              errors.userNameError
            }}</span>
          </div>

          <!-- Email Field -->
          <div class="input-group">
            <label for="email">Email</label>
            <input id="email" type="email" v-model="user.email" />
            <span v-if="errors.emailError" class="error-message">{{
              errors.emailError
            }}</span>
          </div>

          <div class="input-group">
            <label for="gender">Gender</label>
            <select id="gender" v-model="user.gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <!-- Birthday Field -->
          <div class="input-group">
            <label for="birthday">Birthday</label>
            <input
              type="date"
              id="birthday"
              v-model="user.birthDate"
              :min="minDate"
              :max="maxDate"
              :class="{ 'error-input': errors.birthDateError }"
            />
            <span v-if="errors.birthDateError" class="error-message">{{
              errors.birthDateError
            }}</span>
          </div>

          <!-- Buttons -->
          <div class="actions">
            <button
              type="button"
              class="button cancel-button"
              @click="cancelForm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="button save-button"
              :disabled="!profileChanges || hasFormErrors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, computed, watch } from "vue";
import { User, Errors } from "../data";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";

const router = useRouter();
const user = ref({} as User);
const originalUser = ref({} as User);
const errors = ref({
  userNameError: "",
  emailError: "",
  birthDateError: "",
} as Errors);
provide("errors", errors);
provide("user", user);
const socket = io();

socket.on('connect', () => {
  console.log('Connected to the server.');
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});


onMounted(async () => {
  console.log("Fetching user data...");
  user.value = await (await fetch("/api/user")).json();
  originalUser.value = JSON.parse(JSON.stringify(user.value));
});

socket.on("profileSaved", (updatedUser) => {    
    console.log("Profile saved:", updatedUser);
    // 成功保存后更新本地存储的用户信息和版本号
    user.value = updatedUser;
    originalUser.value = JSON.parse(JSON.stringify(updatedUser)); // 更新原始用户数据
  });  
  
  socket.on("saveError", (error) => {
    console.error("Profile save failed:", error);
    alert("Failed to save profile!");
});

const maxDate = ref(new Date().toISOString().substr(0, 10)); // 获取当前日期并转换为 YYYY-MM-DD 格式
const minDate = ref("1900-01-01");

const profileChanges = computed(() => {
  return (
    JSON.stringify(user.value) !== JSON.stringify(originalUser.value) &&
    !hasFormErrors.value
  );
});

const hasFormErrors = computed(() => {
  return (
    errors.value.userNameError !== "" ||
    errors.value.emailError !== "" ||
    errors.value.birthDateError !== ""
  );
});

watch(
  user,
  (newValue) => {
    errors.value.userNameError = newValue.userName
      ? ""
      : "User name cannot be empty";
    errors.value.emailError = newValue.email ? "" : "Email cannot be empty";

    try {
      const birthDate = new Date(newValue.birthDate as Date);
      const today = new Date();
      const minAllowedDate = new Date(minDate.value);

      if (isNaN(birthDate.getTime())) {
        errors.value.birthDateError = "Please enter a valid date.";
      } else if (birthDate > today || birthDate < minAllowedDate) {
        errors.value.birthDateError =
          "Invalid birthday. Please choose a date between 1900 and today.";
      } else {
        errors.value.birthDateError = "";
      }
    } catch (error) {
      errors.value.birthDateError = "Invalid date format.";
    }
  },
  { deep: true }
);

  const forceRefreshBack = () => {
    // Optionally, you can add logic to determine the specific route to go back to
    router.replace('/base').then(() => {
      // This is a trick to ensure the navigation stack is cleared correctly.
      router.back();
    });
  };

  const goBack = () => {
    forceRefreshBack();
  };

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}

const submitForm = () => {
  if (!hasFormErrors.value) {
    console.log("Saving profile:", user.value);
    // 将当前的版本号发送给服务器
    socket.emit("saveProfile", { ...user.value, version: user.value.version });
  } else {
    alert("Please correct the errors before saving.");
  }
};

const cancelForm = () => {
  fetchUserData();
};

const fetchUserData = async () => {
  try {
    const response = await fetch("/api/user");
    if (response.ok) {
      const data = await response.json();
      user.value = data;
    } else {
      throw new Error("Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
</script>

<style scoped lang="scss" , src="../assets/styles/Profile.scss"></style>
