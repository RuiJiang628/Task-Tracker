import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import App from "./App.vue";
import axios from 'axios'

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Admin from "./views/Admin.vue";
import Base from "./views/Base.vue";
// import Register from "./views/Register.vue";
import Dashboard from "./views/Dashboard.vue";
import Profile from "./views/Profile.vue";
import { User } from "./data";

const routes = [
  // a component that will be rendered when the route is matched
  { path: "/admin", component: Admin, meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      try {
        // Make an API call to get the user information
        const response = await fetch('/api/admin', { credentials: 'include' });
        if (!response.ok) next('/dashboard');
        else next(); // If user is an admin, allow access
      } catch (error) {
        // In case of an error or if not authenticated, redirect to the login page
        next('/');
      }
    }
  },
  { path: "/", component: Base },
  // { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true }},
  { path: "/profile", component: Profile, meta: { requiresAuth: true }},
  { path: '/:pathMatch(.*)*', 
    beforeEnter: async (to, from, next) => {
      try {
        await axios.get('/api/check-auth', { withCredentials: true });
        next('/dashboard'); // Redirect to the dashboard
      } catch (error) {
        next('/'); // Redirect to the login page
      }
    }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      // 向后端发送请求来检查用户是否已认证
      await axios.get('/api/check-auth');
      next(); // 用户已认证，允许导航
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // 用户未认证，重定向到登录页面
        next({ path: '/' }); // 假设 '/' 是登录路由
      } else {
        console.error('Error checking authentication:', error);
        // 可以选择处理其他错误或默认导航行为
        next(false);
      }
    }
  } else {
    next(); // 路由不要求认证，直接允许导航
  }
})

createApp(App)
  .use(BootstrapVue)
  .use(BootstrapVueIcons)
  .use(router)
  .mount("#app");
