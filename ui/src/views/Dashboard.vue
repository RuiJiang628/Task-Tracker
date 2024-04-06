<template>
  <div class="task-tracker-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <h1>Task Tracker</h1>
      <div class="add-task">
        <button class="add-task-button">
          Add Task
          <span class="icon-circle">+</span>
        </button>
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
      <!-- Sign out button -->
      <button class="sign-out-button">
        Sign out
        <span class="icon-logout"></span>
        <!-- Use an appropriate icon here -->
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
            v-for="(task, index) in filteredTasks"
            :key="index"
            class="task-item"
            :class="{ checked: task.checked }"
          >
            <!-- Custom Checkbox -->
            <label class="custom-checkbox">
              <input type="checkbox" v-model="task.checked" />
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
      tasks: [
        { text: "Buy monthly groceries", checked: false },
        { text: "Get nails and hair done", checked: false },
        { text: "Prepare Presentations", checked: false },
      ],
      filterStatus: "All",
    };
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
  },
};
</script>

<style scoped lang="scss">
/* Your CSS styles to match the new UI design */

.task-tracker-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 20vw;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 1vw 0;
  box-sizing: border-box;
}

h1 {
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
    width: 36px; /* Width of the circle */
    height: 36px; /* Height of the circle */
    margin-left: auto; /* Pushes the circle to the right */
  }
}

.sign-out-button {
  display: flex;
  position: fixed;
  top: 2vw;
  left: 85vw;
  flex-direction: row; /* Align the text and icon in a row */
  align-items: center; /* Vertically center the text and icon */
  justify-content: center; /* Horizontally center the text */
  padding: 16px 24px; /* Padding inside the button */
  font-family: "Lexend";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  background-color: #ba5112; /* Button background color */
  border: none; /* No border */
  color: #ffffff; /* Text color */
  border-radius: 8px; /* Rounded corners for the button */
  cursor: pointer; /* Change the cursor on hover */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  outline: none; /* Removes the outline */
  white-space: nowrap; /* Prevents wrapping */
  gap: 1vw; /* Gap between the text and the icon */
  width: 10vw;
  height: 5vh;
}

.icon-logout {
  background-image: url("../assets/logout-icon.png"); /* Path to your logout icon */
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  width: 5vw; /* Width of the icon */
  height: 5vh; /* Height of the icon */
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
  margin-left: 5vw;
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
    width: 6vw;
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
      background-color: #ffffff; /* 默认背景色 */
      border: 2px solid #edb046; /* 边框颜色 */
      border-radius: 50%;
      z-index: 0;
    }

    .custom-checkbox input[type="checkbox"]:checked ~ .checkbox-style {
      background-color: #ba5112; /* 选中时的背景色 */
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
</style>
