import { createApp } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Admin from "./views/Admin.vue";
import Base from "./views/Base.vue";
import Dashboard from "./views/Dashboard.vue";
import Profile from "./views/Profile.vue";

const routes: RouteRecordRaw[] = [
  { 
    path: "/admin", 
    component: Admin, 
    meta: { requiresAuth: true },
    beforeEnter: async (_to, _from, next) => {
      const response = await fetch('/api/admin', { credentials: 'include' });
      if (response.ok) next(); 
      else next('/'); 
    }
  },
  { 
    path: "/", 
    component: Base,
    beforeEnter: async (_to, _from, next) => {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) next('/dashboard'); // 用户已登录，重定向到/dashboard
      else next(); // 未登录，渲染Base组件
    }
  },
  { 
    path: "/dashboard", 
    component: Dashboard, 
    meta: { requiresAuth: true },
    beforeEnter: async (_to, _from, next) => {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) next(); // 用户已登录，重定向到/dashboard
      else next('/'); 
    }
  },
  { 
    path: "/profile", 
    component: Profile, 
    meta: { requiresAuth: true }
  },
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/'
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      const response = await fetch('/api/check-auth', { credentials: 'include' });
      if (response.ok) next(); // 已认证，允许导航
      else next('/'); // 未认证，重定向到登录页
    } catch (error) {
      console.error('Authentication check failed:', error);
      next('/login'); // 发生错误时也重定向到登录页
    }
  } else {
    next(); // 不需要认证的路由，直接允许导航
  }
});

createApp(App)
  .use(BootstrapVue as any)
  .use(BootstrapVueIcons as any)
  .use(router)
  .mount("#app");
