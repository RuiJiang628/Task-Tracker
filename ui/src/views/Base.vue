<template>
  <router-view />
  <Dashboard>
    <template v-slot:header>
      <!-- 登录按钮 -->
      <button class="sign-out-button" @click="handleLogin">
        Sign in
      </button>
    </template>
  </Dashboard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Dashboard from './../components/Dashboard.vue';

// 创建响应式用户对象
const user = ref({} as any);
const router = useRouter();

// 页面挂载时获取用户信息
onMounted(async () => {
  try {
    user.value = await (await fetch("/api/user")).json()

    // 登录后根据角色跳转到不同的页面
    if (response.ok && user.value.roles) {
      navigateBasedOnRole(user.value.roles);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    // 如果出现错误，可以选择重定向到登录页或显示错误信息
  }
});

// 点击登录按钮时的处理函数
const handleLogin = () => {
  window.location.href = "/api/login";
};

// 根据用户角色跳转到相应的页面
function navigateBasedOnRole(roles: string[]) {
  if (roles.includes('admin')) {
    window.location.href = "/admin";
  } else {
    window.location.href = "/dashboard";
  }
}
</script>

<style scoped lang='scss' src="../assets/styles/Dashboard.scss"></style>
