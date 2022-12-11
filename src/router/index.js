import Vue from "vue";
import VueRouter from "vue-router";
import Cluster from "../views/Cluster.vue";
import Main from "../views/Main.vue";
import Optimize from "../views/Optimize.vue";
import Overview from "../views/Overview.vue";
import People from "../views/People.vue";
import Simulation from "../views/Simulation.vue";
import Single from "../views/Single.vue";
import Terrain from "../views/Terrain.vue";
import Wind from "../views/Wind.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Main,
    redirect: "overview", //使得网站打开自动重定向到总览页
    children: [
      { path: "overview", component: Overview },
      { path: "wind", component: Wind },
      { path: "terrain", component: Terrain },
      { path: "simulation", component: Simulation },
      { path: "optimize", component: Optimize },
      { path: "single", component: Single },
      { path: "cluster", component: Cluster },
      { path: "people", component: People },
    ],
  },
];
const router = new VueRouter({
  routes, // (缩写) 相当于 routes: routes
});
export default router;
