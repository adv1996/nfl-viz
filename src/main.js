import '@/assets/css/tailwind.css'
import 'vue-select/dist/vue-select.css';
import Vue from 'vue'
import App from './App.vue'
import vSelect from 'vue-select'

Vue.component('v-select', vSelect)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
