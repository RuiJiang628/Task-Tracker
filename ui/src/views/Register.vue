<template>
    <div class="page-background">
        <div class="login-container">
        <h1>Task Tracker</h1>
        <p>Start organizing your life day by day</p>
        <form @submit.prevent="login">
            <input type="text" placeholder="Email" v-model="email" required />
            <input type="password" placeholder="Password" v-model="password" required />
            <button type="submit">Sign Up</button>
        </form>
        <p style="margin-top: 1.3889vw;">Already have an account? Sign in <a href="/login" style="color: #BA5112;">here.</a></p>
        </div>
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
        console.log(this.email, this.password);
      },
    },
  };
</script>
  
<style scoped lang="scss">
    .page-background {
        min-height: 100vh;
        background-image: url('../assets/background.png'); /* Update with the correct path */
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .login-container {
        width: 50vw; // Percentage of the viewport width
        height: 45vw;
        padding: 3vw 4vw; // Padding based on viewport width
        margin: auto;
        margin-top: 5vw; // Top margin percentage
        box-shadow: 0.2778vw 0.2778vw 1.1111vw rgba(0, 0, 0, 0.1); // Box shadow based on viewport width
        border-radius: 1.3889vw; // Border radius percentage
        background: #EDB046;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        font-family: 'Lexend', sans-serif;
    
        h1 {
            font-size: 4.4444vw; // Font size as a percentage of viewport width
            line-height: 5.5556vw; // Line height percentage
            color: #BA5112;
            margin-bottom: 1vw; // Bottom margin
            margin-top: 4vw;
            font-weight: 600;
        }

        p {
            font-size: 1.3889vw; // Font size percentage
            line-height: 1.3889vw; // Line height percentage
            color: #FFFFFF;
            margin-bottom: 3vw; // Bottom margin percentage
        }

        form {
            width: 100%; // Container width
            max-width: 702px; // Max width
            display: flex;
            flex-direction: column;
            align-items: center;

            input {
            width: 40vw; // Input width percentage
            max-width: 702px; // Max width
            padding: 1.6667vw; // Padding percentage
            margin-bottom: 1.6667vw; // Bottom margin percentage
            box-shadow: 0.1389vw 0.1389vw 0.5556vw rgba(0, 0, 0, 0.1);
            border-radius: 0.8333vw; // Border radius percentage
            border: 1px solid #ccc;
            box-sizing: border-box;
            }

            button {
            padding: 1.6667vw 4.1667vw; // Button padding percentage
            width: auto;
            background: #BA5112;
            box-shadow: 0.1389vw 0.1389vw 0.4167vw rgba(0, 0, 0, 0.1);
            border-radius: 0.8333vw; // Border radius percentage
            color: #FFFFFF;
            border: none;
            cursor: pointer;
            margin-top: 1vw; // Top margin
            }
        }
    }
    
</style>
