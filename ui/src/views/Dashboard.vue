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
      <button class="profile-button"></button>
      <!-- Sign out button -->
      <button class="sign-out-button">
        Sign out
        <span class="icon-logout"></span>
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
export default {
  data() {
    return {
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

<style scoped lang="scss">
.task-tracker-container {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 确保伪元素不会超出容器范围 */
}

.task-tracker-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("../assets/background.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  opacity: 0.7; /* 这里设置背景图片的透明度 */
  z-index: -1; /* 确保背景图片在内容之下 */
}

/* 确保其他内容在背景之上 */
.task-tracker-container > * {
  position: relative;
}

.sidebar {
  width: 20vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 1vw 0;
  box-sizing: border-box;
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

h1 {
  cursor: pointer;
  font-size: 2vw;
  line-height: 4vw;
  color: #ba5112;
  margin: 0;
  font-weight: 600;
  font-family: "Lexend";
  width: 100%;
  text-align: center;
}

.add-task {
  margin: 2vw 0; /* Add margin for spacing */

  .add-task-button {
    font-family: "Lexend";
    display: flex;
    align-items: center; /* Centers the text and icon vertically */
    justify-content: space-between; /* Puts space between the text and the icon */
    padding: 10px 20px; /* Padding inside the button */
    font-size: 1rem; /* Text size */
    background-color: #ffffff; /* Button background color */
    border: 1px solid #ccc; /* Border color */
    border-radius: 20px; /* Rounded corners for the button */
    cursor: pointer; /* Change the cursor on hover */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    outline: none; /* Removes the outline */
    border: none; /* Removes the border */
    position: relative; /* Establishes a positioning context for absolutely positioned children */
    gap: 10px; /* Gap between the text and the icon */
  }

  .icon-circle {
    background-color: #ba5112; /* Circle background color */
    color: #ffffff; /* Icon color */
    padding: 8px; /* Padding inside the circle */
    border-radius: 50%; /* Makes the span a circle */
    display: flex; /* Enables center alignment for the plus */
    align-items: center; /* Centers the plus vertically */
    justify-content: center; /* Centers the plus horizontally */
    width: 25px; /* Width of the circle */
    height: 25px; /* Height of the circle */
    margin-left: auto; /* Pushes the circle to the right */
  }
}

.profile-button {
  background-image: url("../assets/profile.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
  display: flex;
  position: fixed;
  top: 2vw; // 顶部的位置可以使用 vw 单位保持响应性
  right: 12rem; // 保持距离 sign-out 按钮适当的距离
  width: 2.5rem; // 使用 rem 单位
  height: 2.5rem; // 使用 rem 单位
  border: none;
  cursor: pointer;
  border-radius: 50%; // 圆形按钮
  outline: none;
}

@media (max-width: 600px) {
  .profile-button {
    top: 1rem; // 减小顶部距离
    right: 7rem; // 减小右侧距离
    width: 2rem; // 减小宽度
    height: 2rem; // 减小高度
  }
}

.sign-out-button {
  display: flex;
  position: fixed;
  top: 2vw; // 这里使用了视口宽度单位，可以根据屏幕大小进行调整
  left: auto; // 改为 auto，使按钮能够基于右侧对齐
  right: 2rem; // 保持按钮相对于屏幕右侧有一定的距离
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem; // 使用 rem 单位，它们基于根元素的字体大小进行缩放
  font-family: "Lexend";
  font-size: 1rem; // 使用 rem 单位以响应不同的屏幕尺寸
  background-color: #ba5112;
  border: none;
  color: #ffffff;
  border-radius: 0.5rem; // 使用 rem 单位保持一致性
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  outline: none;
  gap: 0.5rem; // 使用 rem 单位
  white-space: nowrap; // 防止文本换行
}

@media (max-width: 600px) {
  .sign-out-button {
    top: 1rem; // 对于小屏幕，减小顶部距离
    font-size: 0.8rem; // 对于小屏幕，减小字体大小
    padding: 0.5rem; // 减小内边距
    gap: 0.3rem; // 减小图标和文本之间的距离
  }
}

.icon-logout {
  display: inline-block; // 使图标能够与文本在同一行显示
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 1rem; // 使用 rem 单位
  height: 1rem; // 使用 rem 单位
  background-image: url("../assets/logout-icon.png");
}

@media (max-width: 600px) {
  .icon-logout {
    display: none;
  }
}

.navigation {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-button {
  background: none;
  font-family: "Lexend";
  border: none;
  padding: 1vw;
  margin: 0.5vw 0;
  text-align: center;
  width: 80%;
  box-sizing: border-box;
}

.nav-button.active {
  background-color: #edb046;
  color: #ffffff;
  width: 100%;
}

.main-content {
  flex-grow: 1;
  padding: 1rem;
  margin-top: 10vh;
}

.greeting-section {
  position: relative;
  background-color: #ffffff;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  height: 25%;
  margin-left: 4rem; /* Space from the sidebar */
  margin-bottom: 5%;
  align-content: center;

  h2 {
    font-family: "Lexend";
    font-weight: 600;
    font-size: 2.2rem; /* 35px / 16px = 2.1875rem */
    line-height: 1.6;
    color: #251814;
  }
  p {
    font-family: "Lexend";
  }

  .date {
    position: absolute;
    right: 16px; /* 根据需要调整，这将把日期推向右下角 */
    bottom: 16px; /* 根据需要调整，这也将把日期推向右下角 */
    font-size: 0.8rem;
    color: #666;
  }
}

.task-section {
  background: #fff;
  border-radius: 5px;
  margin-left: 4rem;
  width: 90%;

  .task-header {
    font-family: "Lexend";
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-weight: 500;
    }
  }

  .delete-all-button {
    background: none;
    border: none;
    height: 2vh;
    font-family: "Lexend";
    font-style: normal;
    font-size: 100%;
    line-height: 100%;
    color: #ba5112;
  }

  .task-list {
    display: flex;
    flex-direction: column;

    .task-item {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      padding: 1rem;
      background: #ffffff; // Default background color, assuming this matches the unchecked state
      border-radius: 12px;
      box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s ease; // Smooth transition for background color change
    }

    .custom-checkbox {
      position: relative;
      cursor: pointer;
      display: inline-block;
      width: 25px;
      height: 25px;
    }

    .custom-checkbox input[type="checkbox"] {
      opacity: 0;
      position: absolute;
      width: 100%;
      height: 100%;
      margin: 0;
      z-index: 1;
      cursor: pointer;
    }

    .checkbox-style {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      border: 2px solid #edb046;
      border-radius: 50%;
      z-index: 0;
    }

    .custom-checkbox input[type="checkbox"]:checked ~ .checkbox-style {
      background-color: #ba5112;
    }

    .task-text {
      font-family: "Lexend", sans-serif;
      font-size: 20px;
      line-height: 24px;
      color: #251814; /* Default text color */
      padding-left: 2vw; /* Space for the custom checkbox */
    }

    /* Change the background color of the entire task item when checked */
    .task-item.checked {
      background-color: #edb046; // Background color for the checked state (orange)
      box-shadow: none; // Assuming no shadow in the checked state
    }
  }
}

.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: column;
  background: white;
  padding: 20px;
  border: none;
  border-radius: 10px;
  width: 500px; /* Adjust width as per your requirement */
}

input[type="text"],
textarea {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%; /* Full width of the modal-content */
  padding: 12px; /* Padding inside the input */
  margin-bottom: 16px; /* Space between inputs */
  border: none;
  border-radius: 12px; /* Slightly rounded corners */
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 1em; /* Larger font size */
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-top: none;
  padding: 20px 0;
}

.modal-actions {
  display: flex;
  gap: 10px; /* 按钮之间的空间 */
  justify-content: flex-end;
}

.add-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 0;
}

.delete-button {
  padding: 8px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1em;
  color: white;
  background-color: #d9534f;
  border: none;
  margin-right: auto; /* 将删除按钮推向左侧 */
}

.cancel-button {
  display: flex;
  flex-direction: row;
  padding: 8px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1em;
  color: black;
  background-color: #ffffff;
  border: 2px solid #edb046;
}

.save-button {
  display: flex;
  flex-direction: row;
  padding: 8px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1em;
  color: white;
  background-color: #edb046;
  border: none;
}

.button-disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed; /* 禁止光标图标 */
  /* 确保按钮在禁用状态下看起来不是互动的 */
  pointer-events: none;
}
</style>
