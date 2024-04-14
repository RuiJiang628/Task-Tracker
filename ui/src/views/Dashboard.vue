<template>
  <div class="task-tracker-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <h1>Task Tracker</h1>

      <div class="add-task">
        <button class="add-task-button" @click="showModal = true">
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
      <button v-if="isLoggedIn" class="profile-button"></button>
        <!-- Sign out button -->
        <button
        v-if="isLoggedIn"
        class="sign-out-button"
        @click="logout"
      >
        Sign out
        <span class="icon-logout"></span>
      </button>
      <button
        v-else
        class="sign-out-button"
        @click="login"
      >
        Sign in
      </button>
      <!-- Greeting Section -->
      <div class="greeting-section">
        <h2>Hello, Ray!</h2>
        <p>What do you want to do today?</p>
        <span class="date">Monday, 18 December 2023</span>
      </div>

      <!-- Task Section -->
      <section class="task-section">
        <!-- Task Header -->
        <header class="task-header">
          <h2>{{ taskHeaderTitle }}</h2>
          <div>
            <button class="delete-all-button">Delete All</button>
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

<script>

import io from 'socket.io-client';
import { ref } from 'vue';

const socket = io();
export default {
  data() {
    return {
      isLoggedIn: false, // This will track the login status
      selectedTask: null,
      showEditModal: false,
      showModal: false,
      newTaskTitle: "",
      newTaskDescription: "",
      tasks: [
        {
          id: 1,
          text: "Buy monthly groceries",
          description: "Milk, Bread, Eggs",
          checked: false,
        },
        {
          id: 2,
          text: "Get nails and hair done",
          description: "",
          checked: false,
        },
        {
          id: 3,
          text: "Prepare Presentations",
          description: "",
          checked: false,
        },
      ],
      filterStatus: "All",
    };
  },
  methods: {
    addTask() {
      if (!this.newTaskTitle.trim()) {
        alert("Task title cannot be empty."); // 或者使用更友好的用户通知方式
        return;
      }
      const newTaskId =
        this.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
      const newTask = {
        id: newTaskId,
        text: this.newTaskTitle, // Use `text` instead of `title`
        description: this.newTaskDescription, // Make sure `description` is used
        checked: false,
      };
      this.tasks.push(newTask);
      this.newTaskTitle = "";
      this.newTaskDescription = "";
      this.showModal = false;
    },
    selectTask(task) {
      this.selectedTask = { ...task };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    saveTaskEdits() {
      const index = this.tasks.findIndex((t) => t.id === this.selectedTask.id);
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          text: this.selectedTask.text || this.tasks[index].text,
          description:
            this.selectedTask.description || this.tasks[index].description,
        };
      }
      this.closeEditModal();
    },
    deleteTask(taskId) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId);
      this.closeEditModal(); // 删除任务后关闭模态框
    },

    login() {
      // Simulate login process
      this.socket.emit('request-oidc-auth-url');
      this.isLoggedIn = true;
    },
    logout() {
      // Simulate logout process
      this.isLoggedIn = false;
    }
  },
  computed: {
    filteredTasks() {
      switch (this.filterStatus) {
        case "Active":
          return this.tasks.filter((task) => !task.checked);
        case "Completed":
          return this.tasks.filter((task) => task.checked);
        default:
          return this.tasks;
      }
    },
    taskHeaderTitle() {
      switch (this.filterStatus) {
        case "Active":
          return "Today's Active Tasks";
        case "Completed":
          return "Today's Completed Tasks";
        default:
          return "Today's Tasks";
      }
    },
    canSaveNewTask() {
      return this.newTaskTitle.trim().length > 0;
    },
  },
};
</script>

<style scoped lang='scss', src="../assets/styles/Dashboard.scss"></style>