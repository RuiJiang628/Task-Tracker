import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import Admin from "./views/Admin.vue";
// import Login from "./views/Login.vue";
// import Register from "./views/Register.vue";
import Dashboard from "./views/Dashboard.vue";
import Profile from "./views/Profile.vue";

const routes = [
  // a component that will be rendered when the route is matched
  { path: "/admin", component: Admin },
  // { path: "/login", component: Login },
  // { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard },
  { path: "/profile", component: Profile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(BootstrapVue)
  .use(BootstrapVueIcons)
  .use(router)
  .mount("#app");
