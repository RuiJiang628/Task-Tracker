<template>
  <div class="task-tracker-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <a href="/dashboard">
        <h1>Task Tracker</h1>
      </a>
      <div class="add-task">
        <button
          class="add-task-button"
          @click="showModal = true"
          :disabled="!isLoggedIn"
        >
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
            placeholder="Edit title"
            v-model="editTaskData.title"
          />
          <textarea
            placeholder="Add description (optional)"
            v-model="editTaskData.description"
          ></textarea>
          <div class="modal-footer">
            <button class="delete-button" @click="deleteTask(selectedTask.id)">
              Delete
            </button>
            <div class="modal-actions">
              <button class="cancel-button" @click="cancelEdit">Cancel</button>
              <button
                class="save-button"
                @click="saveTaskEdits"
                :disabled="!canSaveTaskEdits"
                :class="{ 'button-disabled': !canSaveTaskEdits }"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Task Modal Window -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <input type="text" placeholder="Add title" v-model="newTaskTitle" />
          <textarea
            placeholder="Add description (optional)"
            v-model="newTaskDescription"
          ></textarea>
          <div class="add-modal-actions">
            <button class="cancel-button" @click="showModal = false">
              Cancel
            </button>
            <button
              class="save-button"
              @click="saveNewTask"
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
      <slot name="header"></slot>
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
            <button class="delete-all-button" :disabled="!isLoggedIn">
              Delete All
            </button>
          </div>
        </header>

        <!-- Task List -->
        <div class="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.taskID"
            class="task-item"
            :class="{ checked: task.checked }"
            @click="selectTask(task)"
          >
            <!-- Custom Checkbox -->
            <label class="custom-checkbox" @click="toggleTaskChecked(task)">
              <input type="checkbox" v-model="task.checked" />
              <span class="checkbox-style"></span>
            </label>

            <!-- Task Text -->
            <span class="task-text">{{ task.title }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, provide, onUnmounted } from "vue";
import io from "socket.io-client";
import axios from "axios";
import { User, Task, addTask } from "../data";

const selectedTask = ref<Task | null>(null);
const editTaskData = ref<Task | null>(null);
const showEditModal = ref(false);
const showModal = ref(false);
const newTaskTitle = ref("");
const newTaskDescription = ref("");
const newTask = computed(() => {
  return {
    title: newTaskTitle.value,
    description: newTaskDescription.value,
    checked: false,
  };
});
const filterStatus = ref("All");
const tasks = ref([]);
const isLoggedIn = ref(false);

const socket = io();

const user = ref({} as User);
provide("user", user);

const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

function updateDate() {
  currentDate.value = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function selectTask(task: Task) {
  selectedTask.value = task;
  editTaskData.value = { ...task };
  showEditModal.value = true;
}

function cancelEdit() {
  editTaskData.value = null;
  showEditModal.value = false;
}

function closeEditModal() {
  showEditModal.value = false; // close the edit task modal window
}

let intervalId: any;

async function checkAuthentication() {
  try {
    const response = await axios.get("/api/check-auth", {
      withCredentials: true,
    });
    if (response.status === 200) {
      isLoggedIn.value = true;
    } else {
      isLoggedIn.value = false;
    }
  } catch (error) {
    isLoggedIn.value = false;
    console.error("Authentication check failed:", error);
  }
}

// 计算属性
const canSaveNewTask = computed(() => newTaskTitle.value.trim().length > 0);
const canSaveTaskEdits = computed(() => {
  if (!selectedTask.value) {
    return false;
  }
  return selectedTask.value.title.trim().length > 0;
});
const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    switch (filterStatus.value) {
      case "Active":
        return !task.checked;
      case "Completed":
        return task.checked;
      default:
        return true;
    }
  });
});

const taskHeaderTitle = computed(() => {
  switch (filterStatus.value) {
    case "Active":
      return "Today's Active Tasks";
    case "Completed":
      return "Today's Completed Tasks";
    default:
      return "Today's Tasks";
  }
});

function saveNewTask() {
  addTask(newTask.value, {
    onSuccess: (task) => {
      newTaskTitle.value = "";
      newTaskDescription.value = "";
      showModal.value = false;
      fetchTasks();
    },
    onError: (errorMessage) => {
      message.value = errorMessage;
    },
  });
}

function toggleTaskChecked(task: Task) {
  task.checked = !task.checked;
  socket.emit("updateTaskStatus", {
    taskID: task.taskID,
    checked: task.checked,
  });
}

function saveTaskEdits() {
  if (!editTaskData.value || !selectedTask.value) {
    console.error("No task selected or data to save.");
    return;
  }

  socket.emit("updateTask", {
    taskID: selectedTask.value.taskID,
    title: editTaskData.value.title,
    description: editTaskData.value.description,
  });
  console.log(
    "Task update request sent:",
    selectedTask.value.taskID,
    editTaskData.value
  );

  socket.once("taskUpdated", (response) => {
    console.log("Task update success:", response);
    showEditModal.value = false; // 关闭编辑模态窗口
    editTaskData.value = null; // 清空编辑数据
    fetchTasks();
  });

  socket.once("taskError", (error) => {
    console.error("Error updating task:", error.message);
    alert(`Failed to update task: ${error.message}`);
  });
}

// 删除任务的方法
// function deleteTask(taskId) {
//   socket.emit("deleteTask", taskId);
//   socket.on("taskDeleted", () => {
//     tasks.value = tasks.value.filter((task) => task.id !== taskId);
//     alert("Task successfully deleted.");
//   });
//   socket.on("taskError", (error) => {
//     console.error("Error deleting task:", error.message);
//     alert(`Failed to delete task: ${error.message}`);
//   });
// }

// Fetch tasks from the server
onMounted(() => {
  console.log("Dashboard component mounted");
  setupSocketListeners();
  checkAuthentication();
  intervalId = setInterval(updateDate, 1000); // 更新日期每秒钟
});

onUnmounted(() => {
  clearInterval(intervalId);
});

function fetchTasks() {
  socket.emit("getTasks");
}

function setupSocketListeners() {
  socket.on("tasksFetched", (fetchedTasks) => {
    tasks.value = fetchedTasks;
  });

  socket.on("taskError", (data) => {
    console.error(data.message);
  });

  // socket.on("taskDeleted", (taskId) => {
  //   tasks.value = tasks.value.filter((task) => task.id !== taskId);
  //   alert("Task has been successfully deleted.");
  // });

  // 请求任务数据
  fetchTasks();
}
</script>

<style scoped lang="scss" , src="../assets/styles/Dashboard.scss"></style>
