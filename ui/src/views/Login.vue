<template>
    <div class="login-container">
      <h1>Task Tracker</h1>
      <p>Start organizing your life day by day</p>
      <form @submit.prevent="login">
        <input type="text" placeholder="Enter your email" v-model="email" required />
        <input type="password" placeholder="Enter your password" v-model="password" required />
        <button type="submit">Sign In</button>
      </form>
      <a href="/register">Don’t have an account? Create here.</a>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: '',
      };
    },
    methods: {
      login() {
        // 处理登录逻辑
        console.log(this.email, this.password);
        // 例如，验证用户名和密码，然后跳转到另一个视图或显示错误
      },
    },
  };
  </script>
  
  <style scoped lang="scss">
  .login-container {
    max-width: 100%;
    margin: 50px auto;
    padding: 0 20px;
    box-sizing: border-box;
    text-align: center;
  
    h1 {
      /* Task Tracker */
        width: 419px;
        height: 80px;
        font-family: 'Lexend';
        font-style: normal;
        font-weight: 700;
        font-size: 64px;
        line-height: 80px;
        color: #BA5112;
        flex: none;
        order: 0;
        flex-grow: 0;
        margin-bottom: 20px;
    }
  
    p {
      /* Start organizing your life day by day */
        width: 286px;
        height: 20px;
        font-family: 'Lexend';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 20px;
        text-align: center;
        color: #251814;
        flex: none;
        order: 1;
        flex-grow: 0;
        margin-bottom: 40px;
    }
  
    form {
      display: flex;
      flex-direction: column;
  
      input {
        margin-bottom: 10px;
        /* Email */
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 24px 36px;
        gap: 10px;
        width: calc(100% - 72px);
        height: 73px;
        background: #FFFFFF;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        flex: none;
        order: 0;
        flex-grow: 0;
        box-sizing: border-box;
      }
  
      button {
        /* Sign Up */
        display: block;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 24px 60px;
        gap: 10px;
        width: 190px;
        height: 73px;
        background: #EDB046;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        /* Inside auto layout */
        flex: none;
        order: 0;
        flex-grow: 0;
        margin: 20px auto;
      }
    }
  
    a {
      /* Don’t have an account? Create here. */
        width: 353px;
        height: 25px;
        display: block;
        margin-top: 20px;
        font-family: 'Lexend';
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 25px;
        /* identical to box height */
        text-align: center;
        color: #BA5112;
        /* Inside auto layout */
        flex: none;
        order: 1;
        flex-grow: 0;
    }
  }
  </style>
  