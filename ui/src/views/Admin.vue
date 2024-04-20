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
import { onMounted, ref, onUnmounted, provide, watch, computed, reactive } from "vue";
import { User, Errors} from "../data";
import { io } from "socket.io-client";

// Socket connection
const socket = io();

// Reactive state
const users = ref<User[]>([]);
const originalUserData = ref<User>();
const selectedUser = ref<User>();
const showEditUserModal = ref(false);
const error = ref("");
const errors = ref({ userNameError: "", emailError: "", birthDateError: "" });

// Date for the header
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
});

const canSaveUserEdits = computed(() => {
  if (!selectedUser.value) {
    return false;
  }
  
});

// Select user to edit
const selectUser = (user: User) => {
  selectedUser.value = { ...user }; // 深拷贝用户数据
  Object.assign(originalUserData, user); // 保存原始数据
  showEditUserModal.value = true; // 打开编辑用户的弹窗
};

const cancelEdit = () => {
  if (selectedUser.value && originalUserData) {
    Object.assign(selectedUser.value, originalUserData); // 恢复原始数据
  }
  showEditUserModal.value = false;
};

// Close edit modal
const closeEditUserModal = () => {
  showEditUserModal.value = false;
};

// Save user edits
const saveUserEdits = () => {
  if (selectedUser.value) {
    socket.emit("updateUser", selectedUser.value);
  }
  showEditUserModal.value = false;
};

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}

// Watch for changes in the selected user
watch(
  selectedUser,
  (newValue) => {
    if (newValue) {
      errors.value.userNameError = newValue.userName ? "" : "User name cannot be empty";
      errors.value.emailError = newValue.email ? "" : "Email cannot be empty";
    } else {
      // 如果 newValue 不存在，你可以决定如何设置错误信息
      // 比如设置为默认值或清除错误信息
      errors.value.userNameError = "User name cannot be empty";
      errors.value.emailError = "Email cannot be empty";
    }
  },
  { deep: true }
);

const UserChanges = computed(() => {
  return (
    JSON.stringify(selectedUser.value) !== JSON.stringify(originalUserData.value) &&
    !hasFormErrors.value
  );
});

const hasFormErrors = computed(() => {
  return (
    errors.value.userNameError !== "" ||
    errors.value.emailError !== ""
  );
})

// Socket event listeners
socket.on('usersUpdated', updatedUser => {
    console.log('Received update for user:', updatedUser);
    const index = users.value.findIndex(u => (u as any)._id === updatedUser._id);
    if (index !== -1) {
      users.value[index] = updatedUser; // 更新特定用户
    } else {
      users.value.push(updatedUser); // 或者添加新用户
    }
  })
  
// Component lifecycle
onMounted(() => {
  // Fetch users when the component is mounted
  socket.emit('fetchAllUsers');

  // Set up event listeners for user updates
  socket.on('usersFetched', (fetchedUsers) => {
    users.value = fetchedUsers;
  });
});

onUnmounted(() => {
  // Clean up event listeners when the component is unmounted
  socket.off('usersFetched');
  socket.off('usersUpdated');
});

</script>

<style scoped lang="scss" src="../assets/styles/Dashboard.scss"></style>