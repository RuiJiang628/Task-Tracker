<template>
    <div class="dashboard">
      <aside class="sidebar">
        <h2 class="logo">Task Tracker</h2>
        <button class="add-task">Add Task +</button>
        <nav class="menu">
          <ul>
            <li class="menu-item active">Dashboard</li>
            <li class="menu-item">Active</li>
            <li class="menu-item">Completed</li>
          </ul>
        </nav>
      </aside>
  
      <main class="content">
        <header class="header">
          <h1>Dashboard</h1>
          <button class="sign-out">Sign out</button>
        </header>
  
        <section class="greeting-card">
          <h2>Hello, Ray!</h2>
          <p>What do you want to do today?</p>
        </section>
  
        <section class="tasks">
          <div class="tasks-header">
            <h2>Today’s Tasks</h2>
            <button>Delete All</button>
            <span>Monday, 18 December 2023</span>
          </div>
          <ul class="task-list">
            <!-- Task items go here -->
          </ul>
        </section>
  
        <section class="stats">
          <div class="stat completed-tasks">
            <span class="percentage">40%</span>
            <p>Completed tasks</p>
          </div>
          <div class="stat active-tasks">
            <span class="percentage">60%</span>
            <p>Active tasks</p>
          </div>
        </section>
      </main>
    </div>
</template>  
  
<script>
  export default {
    // Vue instance data and methods here
  };
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 25%; /* Based on a 1440px wide design, the sidebar is 361px, which is 25% of the width */
  background-color: #FFFFFF;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.logo {
  /* Logo styles */
}

.add-task {
  /* Add Task button styles */
}

.menu {
  /* Navigation menu styles */
}

.menu-item {
  /* Styles for each navigation item */
}

.menu-item.active {
  background-color: #EDB046; /* Highlight the active menu item */
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}

.header {
  /* Styles for the header within content area */
}

.greeting-card {
  /* Styles for the greeting card */
}

.tasks {
  /* Styles for the tasks section */
}

.task-list {
  /* Styles for the task list */
}

.stats {
  /* Styles for the stats section */
}

.stat {
  /* Styles for each stat item */
}

.completed-tasks {
  /* Specific styles for the completed tasks stat */
}

.active-tasks {
  /* Specific styles for the active tasks stat */
}
</style>

