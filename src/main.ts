import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { attachVue } from '@pixi/pixibot-widget'

import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/pixelify-sans/400.css'
import '@fontsource/pixelify-sans/600.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './assets/styles/main.css'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.use(router)

attachVue(app) // captura errores de componentes Vue para Pixibot

app.mount('#app')
