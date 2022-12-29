<template>
  <el-col>

    <el-menu default-active="overview"
             class="menu"
             :collapse="isCollapse">
      <!-- <el-button @click="isCollapse=!isCollapse">dd</el-button> -->
      <div class="menuItem">
        <el-menu-item v-for="item in menuData"
                      :key="item.name"
                      :index="item.name"
                      @click="clickMenu(item)">
          <i :class="item.icon"></i>
          <span slot="title">{{item.label}}</span>
        </el-menu-item>
      </div>

    </el-menu>
  </el-col>
</template>
<style lang="less" scoped>
.el-col {
  width: 100%;

  .menu {
    height: calc(100vh - 65px);
    h4 {
      text-align: center;
    }
    .logo {
      padding-top: 10px;
    }
  }
}
</style>
<script>
export default {
  data() {
    return {
      isCollapse: false,
      //左侧菜单项目动态储存在这里，方便权限管理（）
      menuData: [
        {
          path: '/overview',
          name: 'main',
          label: '总览',
          icon: 'el-icon-data-line',
          url: 'Overview/Overview',
        },
        {
          path: '/wind',
          name: 'wind',
          label: '风资源',
          icon: 'el-icon-partly-cloudy',
          url: 'Wind/Wind',
        },
        {
          path: '/terrain',
          name: 'terrain',
          label: '地形数据',
          icon: 'el-icon-map-location',
          url: 'Terrain/Terrain',
        },
        {
          path: '/simulation',
          name: 'simulation',
          label: '尾流仿真',
          icon: 'el-icon-wind-power',
          url: 'Simulation/Simulation',
        },
        {
          path: '/optimize',
          name: 'optimize',
          label: '优化操作',
          icon: 'el-icon-odometer',
          url: 'Optimize/Optimize',
        },
        {
          path: '/single',
          name: 'single',
          label: '单机管理',
          icon: 'el-icon-document',
          url: 'Single/Single',
        },
        {
          path: '/cluster',
          name: 'cluster',
          label: '集群管理',
          icon: 'el-icon-document',
          url: 'Cluster/Cluster',
        },
        {
          path: '/people',
          name: 'people',
          label: '人员管理',
          icon: 'el-icon-document',
          url: 'People/People',
        },
      ],
    }
  },
  methods: {
    clickMenu: function (item) {
      // console.log(item)
      if (this.$route.path !== item.path) {
        this.$router.push(item.path)
      }
    },
  },
  // computed: {
  //   isCollapse() {
  //     return this.$store.state.tab.isCollapse
  //   },
  // },
}
</script>
