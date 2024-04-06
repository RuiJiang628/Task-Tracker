<template>
    <div class="task-tracker-container">
      <!-- Left Sidebar -->
      <aside class="sidebar">
        <h1>Task Tracker</h1>
      </aside>
  
      <!-- Right Main Content Area -->
      <div class="main-content">
        <!-- Top Bar with Sign Out -->
        <div class="top-bar">
        <!-- Return Button -->
        <button class="button return-button">
          Return
          <span class="icon-return"></span>   
        </button>

        <!-- Sign Out Button -->
        <button class="button sign-out-button">
          Sign out
          <span class="icon-logout"></span>   
        </button>
      </div>
  
    <!-- Edit Profile Section -->
    <div class="edit-profile">
    <h2>Edit profile</h2>
    <form @submit.prevent="submitForm">
        <!-- User Name Field -->
        <div class="input-group">
        <label for="username">User Name</label>
        <input id="username" type="text" v-model="profile.username">
        </div>

        <!-- Email Field -->
        <div class="input-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="profile.email">
        </div>

        <!-- Password Field -->
        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="profile.password">
        </div>

        <!-- Birthday Field -->
        <div class="input-group">
          <label for="birthday">Birthday</label>
          <input id="birthday" type="date" v-model="profile.birthday">
        </div>

        <!-- Buttons -->
        <div class="actions">
            <button type="cancel" class="cancel-button">Cancel</button>
          <button type="submit" class="save-button">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      profile: {
        username: 'Ray',
        email: '123@123.com',
        password: '********',
        birthday: '2003-12-21'
      }
    };
  },
  methods: {
    submitForm() {
      console.log('Form submitted', this.profile);
    },
    cancelEdit() {
      console.log('Edit cancelled');
    }
  }
};
</script>
  
<style scoped>
/* Include your existing styles for the sidebar, top bar, etc. */
  
.task-tracker-container {
    display: flex;
    /* flex-direction: row; */
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('../assets/background.png'); /* Update with the correct path */
}

.sidebar {
    width: 20vw;
    height: 100vh;
    background: transparent;
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

.edit-profile {
    width: 50vw;
    margin: 2em auto;
    padding: 2em;
    align-items: center;
    background: #fff;
    margin-left: 10%;
    margin-top: 15%;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h2 {
        margin-bottom: 1em;
        font-family: "Lexend";
    }

    label {
        font-family: "Lexend";
        display: block;
        margin-top: 0.5em;
        font-weight: 400;
    }

    input {
        font-family: "Lexend";
        width: 100%;
        padding: 0.5em;
        margin-bottom: 0.5em;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
}

/* 公共样式 */
.button {
    display: flex;
    position: fixed;
    top: 2vw;
    flex-direction: row; /* Align the text and icon in a row */
    align-items: center; /* Vertically center the text and icon */
    justify-content: center; /* Horizontally center the text */
    padding: 16px 24px; /* Padding inside the button */
    font-family: "Lexend";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
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

/* 独特样式 */
.sign-out-button {
    left: 85vw;
    background-color: #ba5112; /* Button background color */

    .icon-logout {
        background-image: url("../assets/logout-icon.png"); /* Path to your logout icon */
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        width: 5vw; /* Width of the icon */
        height: 5vh; /* Height of the icon */
    }
    }

    .return-button {
    left: 73vw;
    background-color: #EDB046; /* Button background color */

    .icon-return {
        background-image: url("../assets/return-icon.png"); /* Path to your return icon */
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        width: 2.5vw; /* Width of the icon */
        height: 2.5vh; /* Height of the icon */
    }
}

.actions{
  display: flex;
  justify-content: flex-end;
  gap: 10px; /* Spacing between buttons */
  margin-top: 20px; /* Space above the button container */
}

.cancel-button {
  background-color: #EDB046; /* Button background color */
  color: #ffffff; /* Text color */
  padding: 10px 20px; /* Padding inside the button */
  border-radius: 5px; /* Rounded corners for the button */
  border: none; /* No border */
  cursor: pointer; /* Change the cursor on hover */
  font-family: "Lexend";
  font-size: 16px;
  font-weight: 400;
}

.save-button {
  background-color: #ba5112; /* Button background color */
  color: #ffffff; /* Text color */
  padding: 10px 20px; /* Padding inside the button */
  border-radius: 5px; /* Rounded corners for the button */
  border: none; /* No border */
  cursor: pointer; /* Change the cursor on hover */
  font-family: "Lexend";
  font-size: 16px;
  font-weight: 400;
}

</style>
  