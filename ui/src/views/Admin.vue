<template>
  <div class="task-tracker-container">
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
        <span class="date">{{ currentDate }}</span>
      </div>

      <section class="task-section">
        <header class="task-header">
          <h2>Users</h2>
        </header>

        <div v-if="showEditUserModal" class="modal" @click.self="closeEditUserModal">
          <div class="modal-content" @click.stop>
            <!-- Bind the inputs to the selectedUser properties -->
            <label for="netID">NetID</label>
            <input
              v-if="selectedUser" 
              type="user-text" 
              v-model="selectedUser.netID"
              disabled
            />
            <label for="userName">User Name</label>
            <input
              v-if="selectedUser" 
              placeholder="Edit username"
              type="user-text" 
              v-model="selectedUser.userName" 
            />
            <span v-if="errors.userNameError" class="error-message">{{
              errors.userNameError
            }}</span>
            <label for="email">Email</label>
            <input
              v-if="selectedUser" 
              type="user-text"
              placeholder="Edit email"
              v-model="selectedUser.email"
            />
            <span v-if="errors.emailError" class="error-message">{{
              errors.emailError
            }}</span>
            <div class="modal-footer">
              <div class="modal-actions">
                <button class="cancel-button" @click="cancelEdit">
                  Cancel
                </button>
                <button 
                class="save-button" 
                @click="saveUserEdits" 
                :disabled="!UserChanges"
                :class="{ 'button-disabled': !UserChanges}">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="task-list">
          <div
            v-for="user in users"
            :key="user._id"
            class="task-item"
            @click="selectUser(user)"
          >
            <!-- Task Text -->
            <span class="task-text">{{ user.netID }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { User } from "../data";
import { io } from "socket.io-client";

const socket = io();
const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const originalUserData = ref<User | null>(null);
const showEditUserModal = ref(false);
const errors = ref({ userNameError: "", emailError: "" });

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
});

const selectUser = (user: User) => {
  selectedUser.value = { ...user };
  originalUserData.value = { ...user }; 
  showEditUserModal.value = true;
};

const saveUserEdits = () => {
  if (selectedUser.value) {
    socket.emit("updateUser", {
      ...selectedUser.value,
      version: selectedUser.value.version 
    });
  }
};

const UserChanges = computed(() => {
  return JSON.stringify(selectedUser.value) !== JSON.stringify(originalUserData.value) &&
         !hasFormErrors.value;
});

const hasFormErrors = computed(() => {
  return errors.value.userNameError !== "" || errors.value.emailError !== "";
});

socket.on('userUpdated', (updatedUser) => {
  const index = users.value.findIndex(u => u._id === updatedUser._id);
  if (index !== -1) {
    users.value[index] = updatedUser; 
    if (selectedUser.value && selectedUser.value._id === updatedUser._id) {
      selectedUser.value = { ...updatedUser }; 
      originalUserData.value = { ...updatedUser }; 
    }
  }
  showEditUserModal.value = false; 
});

socket.on('usersUpdated', updatedUser => {
  console.log('Received update for user:', updatedUser);
  const index = users.value.findIndex(u => (u as any)._id === updatedUser._id);
  if (index !== -1) {
    users.value[index] = updatedUser; 
  } else {
    users.value.push(updatedUser); 
  }
})

socket.on('updateError', (error) => {
  console.error('Error updating user:', error.message);
  alert(`Update failed: ${error.message}. Please refresh data.`);
});

socket.on('usersFetched', (fetchedUsers) => {
  console.log('Fetched users:', fetchedUsers);
  users.value = fetchedUsers;
});

socket.on('userConnected', (user) => {
  console.log('User connected:', user);
});

onMounted(() => {
  console.log('Fetching all users...');
  socket.emit('fetchAllUsers');
});

const cancelEdit = () => {
  if (selectedUser.value && originalUserData.value) {
    selectedUser.value = { ...originalUserData.value }; 
  }
  showEditUserModal.value = false;
};

const closeEditUserModal = () => {
  showEditUserModal.value = false;
};

const logout = () => {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
};

watch(
  selectedUser,
  (newValue) => {
    if (newValue) {
      errors.value.userNameError = newValue.userName ? "" : "User name cannot be empty";
      errors.value.emailError = newValue.email ? "" : "Email cannot be empty";
    } else {
      errors.value.userNameError = "User name cannot be empty";
      errors.value.emailError = "Email cannot be empty";
    }
  },
  { deep: true }
);

</script>


<style scoped lang="scss" src="../assets/styles/Dashboard.scss"></style>