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
  },
  { 
    path: "/", 
    component: Base,
  },
  { 
    path: "/dashboard", 
    component: Dashboard, 
  },
  { 
    path: "/profile", 
    component: Profile, 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(BootstrapVue as any)
  .use(BootstrapVueIcons as any)
  .use(router)
  .mount("#app");
