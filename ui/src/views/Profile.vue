<template>
    <div class="container">
      <header class="header">
        <h1>Task Tracker</h1>
        <div class="buttons">
          <button class="return-button">Return</button>
          <button class="sign-out-button">Sign out</button>
        </div>
      </header>
  
      <main class="edit-profile">
        <h2>Edit profile</h2>
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label for="userName">User Name</label>
            <input type="text" id="userName" v-model="profile.userName" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="profile.email" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="profile.password" />
          </div>
          <div class="form-group">
            <label for="birthday">Birthday</label>
            <input type="date" id="birthday" v-model="profile.birthday" />
          </div>
          <div class="actions">
            <button type="button" class="cancel-button">Cancel</button>
            <button type="submit" class="save-button">Save</button>
          </div>
        </form>
      </main>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
  
  const profile = reactive({
    userName: 'Ray',
    email: '123@123.com',
    password: '********',
    birthday: '2003-12-21',
  });
  
  const saveProfile = () => {
    // Handle form submission logic
    alert('Profile saved!');
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .buttons {
    display: flex;
    gap: 1rem;
  }
  
  .return-button,
  .sign-out-button {
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
  }
  
  .edit-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  h2 {
    margin: 1rem 0;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
  }
  
  .form-group input {
    padding: 0.5rem;
    width: 20rem;
    margin-top: 0.5rem;
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  
  .cancel-button,
  .save-button {
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
  }
  
  .cancel-button {
    background-color: #f3f3f3;
  }
  
  .save-button {
    background-color: #ba5112;
    color: white;
  }
  </style>
  