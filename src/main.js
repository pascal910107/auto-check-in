import "jquery";
import "./styles/app.css";
import { createApp } from "vue";
import App from "./popup.vue";

const app = createApp(App);
app.mount("#app");
