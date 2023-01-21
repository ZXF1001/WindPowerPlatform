<template>
  <el-col>

    <el-menu default-active="overview"
             class="menu"
             :collapse="isCollapse"
             :collapse-transition="true">

      <div class="menuItem">
        <el-tooltip content="展开"
                    placement="right"
                    :disabled="!isCollapse">
          <el-menu-item index="collapse"
                        @click="changeCollapse">
            <div class="collapseWrap"><i :class="collapseIcon" /></div>
          </el-menu-item>
        </el-tooltip>
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
  @height: calc(100vh - 65px);
  width: 100%;
  .menu {
    height: @height;
    h4 {
      text-align: center;
    }
    .logo {
      padding-top: 10px;
    }
  }
  .menu:not(.el-menu--collapse) {
    width: 160px;
    height: @height;
  }
  .collapseWrap {
    text-align: center;
  }
}
</style>
<script>
export default {
  data() {
    return {
      collapseIcon: 'el-icon-arrow-left',
      //左侧菜单项目动态储存在这里，方便权限管理（）
      menuData: [
        {
          path: '/overview',
          name: 'main',
          label: '总览',
          icon: 'el-icon-data-line',
        },
        {
          path: '/wind',
          name: 'wind',
          label: '风资源',
          icon: 'el-icon-partly-cloudy',
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
        },
        {
          path: '/optimize',
          name: 'optimize',
          label: '优化操作',
          icon: 'el-icon-odometer',
        },
        {
          path: '/single',
          name: 'single',
          label: '单机管理',
          icon: 'el-icon-document',
        },
        {
          path: '/cluster',
          name: 'cluster',
          label: '集群管理',
          icon: 'el-icon-document',
        },
        {
          path: '/people',
          name: 'people',
          label: '人员管理',
          icon: 'el-icon-document',
        },
      ],
    }
  },
  methods: {
    changeCollapse() {
      this.$store.commit('COLLAPSE_MENU')
      this.collapseIcon = this.isCollapse
        ? 'el-icon-arrow-right'
        : 'el-icon-arrow-left'
    },
    clickMenu: function (item) {
      if (this.$route.path !== item.path) {
        this.$router.push(item.path)
      }
    },
  },
  computed: {
    isCollapse() {
      return this.$store.state.tab.isCollapse
    },
  },
}
</script>
