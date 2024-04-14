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

        <div class="input-group">
          <label for="gender">Gender</label>
          <select id="gender" v-model="profile.gender">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Birthday Field -->
        <div class="input-group">
          <label for="birthday">Birthday</label>
          <input id="birthday" type="date" v-model="profile.birthday">
        </div>

        <!-- Buttons -->
        <div class="actions">
            <button type="cancel" class="button cancel-button">Cancel</button>
          <button type="submit" class="button save-button">Save</button>
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
        gender: '',
        birthday: ''
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
  
<style scoped lang='scss', src="../assets/styles/Profile.scss"></style>
  