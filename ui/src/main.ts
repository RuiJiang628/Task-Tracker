import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Admin from './views/Admin.vue'
import EndUser from './views/EndUser.vue'

const routes = [
	// a component that will be rendered when the route is matched
	{ path: "/admin", component: Admin },
	{ path: "/list/:listId", component: EndUser,
		props(route) {
			return {
				listId: route.params.listId
			};
		}
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.use(BootstrapVue)
	.use(BootstrapVueIcons)
	.use(router)
	.mount('#app')
