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
        <button class="nav-button active">Dashboard</button>
        <button class="nav-button">Active</button>
        <button class="nav-button">Completed</button>
      </nav>
    </aside>

    <!-- 右侧主体内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="main-header">
        <h1>Hello, Ray!</h1>
        <button class="sign-out-button">Sign out</button>
      </header>

      <!-- 任务列表 -->
      <section class="task-section">
        <header class="task-header">
          <h2>Today’s Tasks</h2>
          <button class="delete-all-button">Delete All</button>
          <span class="date">Monday, 18 December 2023</span>
        </header>

        <div class="task-list">
          <!-- Task items -->
          <div class="task-item">
            <input type="checkbox" id="task-1" checked>
            <label for="task-1">Buy monthly groceries</label>
          </div>
          <!-- Repeat for other tasks -->
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// Your existing script logic here...
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
  background: #FFFFFF;
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
  color: #BA5112;
  margin: 0; 
  font-weight: 600;
  font-family: 'Lexend';
  width: 100%; 
  text-align: center; 
}

.add-task {
  margin: 2vw 0; /* Add margin for spacing */
  
  .add-task-button {
  display: flex;
  align-items: center; /* Centers the text and icon vertically */
  justify-content: space-between; /* Puts space between the text and the icon */
  padding: 10px 20px; /* Padding inside the button */
  font-size: 1rem; /* Text size */
  background-color: #FFFFFF; /* Button background color */
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
  background-color: #BA5112; /* Circle background color */
  color: #FFFFFF; /* Icon color */
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

.navigation {
  width: 100%; 
  display: flex;
  flex-direction: column;
  align-items: center; 
}

.nav-button {
  background: none;
  border: none;
  padding: 1vw;
  margin: 0.5vw 0; 
  text-align: center;
  width: 80%;
  box-sizing: border-box;
}

.nav-button.active {
  background-color: #FFC107;
  color: #FFFFFF;
  width: 100%;
}

.main-content {
  flex-grow: 1;
  padding: 1rem;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-section {
  background: #FFF;
  padding: 1rem;
  border-radius: 5px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-all-button {
  background: none;
  border: none;
}

.date {
  font-size: 0.8rem;
  color: #666;
}

.task-list {
  margin-top: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.task-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

.task-item label {
  font-size: 1rem;
}
</style>
