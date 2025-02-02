<template>
  <div class="task-tracker-container">
    <aside class="sidebar">
      <a href="/dashboard">
        <h1>Task Tracker</h1>
      </a>
      <div class="add-task">
        <button
          class="add-task-button"
          @click="showModal = true"
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
            v-if="editTaskData"
            v-model="editTaskData.title"
          />
          <textarea
            placeholder="Add description (optional)"
            v-if="editTaskData"
            v-model="editTaskData.description"
          ></textarea>
          <div class="modal-footer">
            <button class="delete-button" @click="deleteTask()">
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
            <button
              class="delete-all-button"
              :disabled="!enableDeleteAll"
              @click="deleteAllTasks"
            >
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
            <label
              class="custom-checkbox"
              @click.stop="toggleTaskChecked(task)"
            >
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
// import axios from "axios";
import { User, Task, addTask } from "../data";
// import axios from "axios";

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
    version: 0
  };
});
const filterStatus = ref("All");
const tasks = ref<Task[]>([]);
const message = ref('');

const socket = io();

const user = ref({} as User);
provide("user", user);

// Message to display
const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

// Update the date
function updateDate() {
  currentDate.value = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Show the edit modal
function selectTask(task: Task) {
  selectedTask.value = task;
  editTaskData.value = { ...task };
  showEditModal.value = true;
}

// Cancel the edit operation
function cancelEdit() {
  editTaskData.value = null;
  showEditModal.value = false;
}

// Close the edit modal
function closeEditModal() {
  showEditModal.value = false;
}

let intervalId: any;

// Enable save button for new tasks
const canSaveNewTask = computed(() => newTaskTitle.value.trim().length > 0);

// Enable save button for task edits
const canSaveTaskEdits = computed(() => {
  if (!selectedTask.value || !editTaskData.value) {
    return false;
  }
  return editTaskData.value.title.trim().length > 0;
});

// Enable delete all button
const enableDeleteAll = computed(() => tasks.value.length > 0);
console.log("enableDeleteAll", enableDeleteAll);

// Filter tasks based on status
const filteredTasks = computed<Task[]>(() => {
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

// Task Header Title
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

// Add a new task
function saveNewTask() {
  addTask(newTask.value, {
    onSuccess: () => {
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

// Toggle task checked status
function toggleTaskChecked(task: Task) {
  task.checked = !task.checked;
  socket.emit("updateTaskStatus", {
    taskID: task.taskID,
    checked: task.checked,
  });
}

socket.on("taskUpdated", (response) => {
  console.log("Task status update success:", response);
  fetchTasks();
});

// Save task edits
function saveTaskEdits() {
  if (!editTaskData.value || !selectedTask.value) {
    console.error("No task selected or data to save.");
    return;
  }

  socket.emit("updateTask", {
    taskID: selectedTask.value.taskID,
    title: editTaskData.value.title,
    description: editTaskData.value.description,
    version: selectedTask.value.version
  });
  console.log(
    "Task update request sent:",
    selectedTask.value.taskID,
    editTaskData.value
  );

  socket.once("taskUpdated", (response) => {
    console.log("Task update success:", response);
    showEditModal.value = false;
    editTaskData.value = null;
    if (selectedTask.value) {
      selectedTask.value.version++;
    }
    fetchTasks();
  });

  socket.once("taskError", (error) => {
    console.error("Error updating task:", error.message);
    alert(`Failed to update task: ${error.message}`);
  });
}

// Delete a task
function deleteTask() {
  if (!selectedTask.value) {
    console.error("No task selected.");
    return;
  }

  socket.emit("deleteTask", { taskID: selectedTask.value.taskID });
}

socket.on("taskDeleted", () => {
  showEditModal.value = false;
  tasks.value = tasks.value.filter(
    (task) => task.taskID !== (selectedTask.value ? selectedTask.value.taskID : null)
  );
  fetchTasks();
});

// socket.on("taskError", (error) => {
//   console.error("Error deleting task:", error.message);
//   alert(`Failed to delete task: ${error.message}`);
// });

// Delete all tasks
function deleteAllTasks() {
  socket.emit("deleteAllTasks", { status: filterStatus.value });

  socket.on("allTasksDeleted", () => {
    fetchTasks();
    console.log("Appropriate tasks have been successfully deleted.");
  });

  // socket.on("taskError", (error) => {
  //   console.error("Error deleting tasks:", error.message);
  //   alert(`Failed to delete tasks: ${error.message}`);
  // });
}

// Fetch tasks from the server
onMounted(() => {
  console.log("Dashboard component mounted");
  setupSocketListeners();
  // checkAuthentication();
  intervalId = setInterval(updateDate, 1000); 
});

socket.on("taskAdded", () => {
  fetchTasks();
});

// Clear the interval
onUnmounted(() => {
  clearInterval(intervalId);
});

// Fetch tasks from the server
function fetchTasks() {
  socket.emit("getTasks");
}

// Setup socket listeners
function setupSocketListeners() {
  socket.on("tasksFetched", (fetchedTasks) => {
    tasks.value = fetchedTasks;
  });

  socket.on("taskError", (data) => {
    console.error(data.message);
  });

  fetchTasks();
}
</script>

<style scoped lang="scss" , src="../assets/styles/Dashboard.scss"></style>
