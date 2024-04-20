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
                <button class="cancel-button" @click="showEditUserModal = false">
                  Cancel
                </button>
                <button class="save-button" @click="saveUserEdits">
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
import { onMounted, ref, onUnmounted, provide, watch, computed } from "vue";
import { User, Errors} from "../data";
import { io } from "socket.io-client";

const socket = io(); // 使用你的Socket.IO服务器地址
const users = ref<User[]>([]) // 用于存储从服务器接收到的用户数据
const error = ref(null);

const errors = ref({
  userNameError: "",
  emailError: "",
  birthDateError: "",
} as Errors);

provide("errors", errors);

let intervalId: any

const showEditUserModal = ref(false);
const selectedUser = ref<User>();

// 方法用于在用户点击用户列表项时设置被选中的用户
const selectUser = (user: User) => {
  selectedUser.value = user;  // 将点击的用户设置为 selectedUser，从而可以编辑
  showEditUserModal.value = true; // 打开编辑用户的弹窗
  console.log('Selected user:', user);
};

function closeEditUserModal() {
  showEditUserModal.value = false;
}

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

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}

const currentDate = ref(new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}));

function updateDate() {
  currentDate.value = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

onMounted(() => {  
  intervalId = setInterval(updateDate, 1000); // 更新日期每秒钟
  socket.emit('fetchAllUsers');
  socket.on('usersFetched', fetchedUsers => {
    console.log('Received users:', fetchedUsers);
    users.value = fetchedUsers;
  });

  socket.on('unauthorized', message => {
    console.error('Unauthorized:', message);
    error.value = message.message;
  });
  socket.on('error', data => {
    console.error('Error:', data.message);
    error.value = data.message;
  })

  socket.on('userUpdated', updatedUser => {
    console.log('Received update for user:', updatedUser);
    const index = users.value.findIndex(u => (u as any)._id === updatedUser._id);
    if (index !== -1) {
      users.value[index] = updatedUser; // 更新特定用户
    } else {
      users.value.push(updatedUser); // 或者添加新用户
    }
  })
});

onUnmounted(() => {
  clearInterval(intervalId); // 清除计时器防止内存泄漏
})

</script>

<style scoped lang="scss" , src="../assets/styles/Dashboard.scss"></style>
