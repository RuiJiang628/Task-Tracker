<template>
  <div class="task-tracker-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <a href="/dashboard">
        <h1>Task Tracker</h1>
      </a>
      <div class="add-task">
        <button class="add-task-button" @click="showModal = true" :disabled="!isLoggedIn">
          Add Task
          <span class="icon-circle">+</span>
        </button>
      </div>
      <!-- Edit Task Modal Window-->
      <div v-if="showEditModal" class="modal" @click.self="closeEditModal">
        <div class="modal-content" @click.stop>
          <!-- Use the selectedTask for binding the inputs -->
          <input
            type="text"
            placeholder="Add title"
            v-model="selectedTask.text"
          />
          <textarea
            placeholder="Add description"
            v-model="selectedTask.description"
          ></textarea>
          <div class="modal-footer">
            <button class="delete-button" @click="deleteTask(selectedTask.id)">
              Delete
            </button>
            <div class="modal-actions">
              <button class="cancel-button" @click="showEditModal = false">
                Cancel
              </button>
              <button class="save-button" @click="saveTaskEdits">Save</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Task Modal Window -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <input type="text" placeholder="Add title" v-model="newTaskTitle" />
          <textarea
            placeholder="Add description"
            v-model="newTaskDescription"
          ></textarea>
          <div class="add-modal-actions">
            <button class="cancel-button" @click="showModal = false">
              Cancel
            </button>
            <button
              class="save-button"
              @click="addTask"
              :disabled="!canSaveNewTask"
              :class="{ 'button-disabled': !canSaveNewTask }"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <nav class="navigation">
        <button
          class="nav-button"
          :class="{ active: filterStatus === 'All' }"
          @click="filterStatus = 'All'"
        >
          Dashboard
        </button>
        <button
          class="nav-button"
          :class="{ active: filterStatus === 'Active' }"
          @click="filterStatus = 'Active'"
        >
          Active
        </button>
        <button
          class="nav-button"
          :class="{ active: filterStatus === 'Completed' }"
          @click="filterStatus = 'Completed'"
        >
          Completed
        </button>
      </nav>
    </aside>

    <!-- Main content area -->
    <div class="main-content">
      <slot name = "header"></slot>
      <!-- Greeting Section -->
      <div class="greeting-section">
        <slot name="greeting"></slot>
        <span class="date">{{ currentDate }}</span>
      </div>

      <!-- Task Section -->
      <section class="task-section">
        <!-- Task Header -->
        <header class="task-header">
          <h2>{{ taskHeaderTitle }}</h2>
          <div>
            <button class="delete-all-button"  :disabled="!isLoggedIn">Delete All</button>
          </div>
        </header>

        <!-- Task List -->
        <div class="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-item"
            :class="{ checked: task.checked }"
            @click="selectTask(task)"
          >
            <!-- Custom Checkbox -->
            <label class="custom-checkbox" @click.stop>
              <input type="checkbox" v-model="task.checked" @click.stop />
              <span class="checkbox-style"></span>
            </label>

            <!-- Task Text -->
            <span class="task-text">{{ task.text }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
  
<script setup lang="ts">
  import { ref, onMounted, computed, provide, onUnmounted } from 'vue';
  import io from 'socket.io-client';
  import axios from 'axios';
  import { User, Task } from '../data';

  // 响应性状态
  const selectedTask = ref<Task | null>(null);
  const showEditModal = ref(false);
  const showModal = ref(false);
  const newTaskTitle = ref("");
  const newTaskDescription = ref("");
  const filterStatus = ref("All");
  const tasks = ref<Task[]>([
    // 初始化任务...
  ]);
  const isLoggedIn = ref(false);

  const socket = io(); // 使用你的Socket.IO服务器地址

  const user = ref({} as User);
  provide("user", user);

  const currentDate = ref(new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }));

  function updateDate() {
    currentDate.value = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  
  let intervalId;

  onMounted(() => {
    intervalId = setInterval(updateDate, 1000); // 更新日期每秒钟
  })

  onUnmounted(() => {
    clearInterval(intervalId); // 清除计时器防止内存泄漏
  })

  async function checkAuthentication() {
    try {
      const response = await axios.get('/api/check-auth', { withCredentials: true });
      if (response.status === 200) {
        isLoggedIn.value = true;
      } else {
        isLoggedIn.value = false;
      }
    } catch (error) {
      isLoggedIn.value = false;
      console.error('Authentication check failed:', error);
    }
  }

  onMounted(() => {
    checkAuthentication();
  });

  // 方法
  // function addTask() {
  //   if (!newTaskTitle.value.trim()) {
  //     alert("Task title cannot be empty."); // 或者使用更友好的用户通知方式
  //     return;
  //   }
  //   const newTaskId = tasks.value.reduce((maxId, task) => Math.max(maxId, task.id as number), 0) + 1;
  //   const newTask: Task = {
  //     id: newTaskId.toString(),
  //     title: newTaskTitle.value,
  //     description: newTaskDescription.value,
  //     checked: false,
  //   };
  //   tasks.value.push(newTask);
  //   newTaskTitle.value = "";
  //   newTaskDescription.value = "";
  //   showModal.value = false;
  // }

  // 其他方法...
  // 注意：你需要根据 `Task` 接口调整 `selectTask`、`saveTaskEdits`、`deleteTask` 等方法

  // 计算属性
  const canSaveNewTask = computed(() => newTaskTitle.value.trim().length > 0);
  const filteredTasks = computed(() => {
    return tasks.value.filter((task) => {
      switch (filterStatus.value) {
        case "Active": return !task.checked;
        case "Completed": return task.checked;
        default: return true;
      }
    });
  });
  const taskHeaderTitle = computed(() => {
    switch (filterStatus.value) {
      case "Active": return "Today's Active Tasks";
      case "Completed": return "Today's Completed Tasks";
      default: return "Today's Tasks";
    }
  });

  // 如果你需要对外暴露一些属性或方法，可以使用 `defineExpose`，例如：
  // defineExpose({ addTask, selectedTask });
</script>
  
<style scoped lang='scss', src="../assets/styles/Dashboard.scss"></style>