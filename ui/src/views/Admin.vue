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
              placeholder="NetID" 
              v-model="selectedUser.netID"
              disabled
            />
            <label for="userName">User Name</label>
            <input
              v-if="selectedUser" 
              type="user-text" 
              placeholder="User Name" 
              v-model="selectedUser.userName" 
            />
            <!-- <span v-if="errors.userNameError" class="error-message">{{
              errors.userNameError
            }}</span> -->
            <label for="email">Email</label>
            <input
              v-if="selectedUser" 
              type="user-text"
              placeholder="Email"
              v-model="selectedUser.email"
            />
            <!-- <span v-if="errors.emailError" class="error-message">{{
              errors.emailError
            }}</span> -->
            <label for="gender">Gender</label>
            <select v-if="selectedUser" v-model="selectedUser.gender" disabled>
            </select>
            <label for="birthDate">Birth Date</label>
            <input
              type="date"
              v-if="selectedUser" 
              v-model="selectedUser.birthDate"
              disabled
            />
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
import { onMounted, ref, onUnmounted, provide, watch } from "vue";
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
const selectedUser = ref<User | null>(null);

// 方法用于在用户点击用户列表项时设置被选中的用户
const selectUser = (user: User) => {
  selectedUser.value = user;  // 将点击的用户设置为 selectedUser，从而可以编辑
  showEditUserModal.value = true; // 打开编辑用户的弹窗
};

function closeEditUserModal() {
  showEditUserModal.value = false;
}

function saveUserEdits() {
  // 发送更新到服务器的逻辑
  // 例如，使用 socket.emit 或通过 HTTP 请求
}

// watch(
//   selectUser,
//   (newValue) => {
//     errors.value.userNameError = newValue.userName
//       ? ""
//       : "User name cannot be empty";
//     errors.value.emailError = newValue.email ? "" : "Email cannot be empty";

//     try {
//       const birthDate = new Date(newValue.birthDate as Date);
//       const today = new Date();
//       const minAllowedDate = new Date(minDate.value);

//       if (isNaN(birthDate.getTime())) {
//         errors.value.birthDateError = "Please enter a valid date.";
//       } else if (birthDate > today || birthDate < minAllowedDate) {
//         errors.value.birthDateError =
//           "Invalid birthday. Please choose a date between 1900 and today.";
//       } else {
//         errors.value.birthDateError = "";
//       }
//     } catch (error) {
//       errors.value.birthDateError = "Invalid date format.";
//     }
//   },
//   { deep: true }
// );

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

function fetchAllUsers() {
  socket.emit('fetchAllUsers');
}

</script>

<style scoped lang="scss" , src="../assets/styles/Dashboard.scss"></style>
