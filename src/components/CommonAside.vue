<template>
  <el-col>
    <el-menu class="menu"
             default-active="overview"
             :collapse="isCollapse"
             :collapse-transition="true">

      <el-tooltip content="展开"
                  placement="right"
                  :disabled="!isCollapse">
        <el-menu-item index="collapse"
                      @click="changeCollapse">
          <div class="collapseWrap"><i :class="collapseIcon" /></div>
        </el-menu-item>
      </el-tooltip>

      <el-menu-item :key="overviewData.name"
                    :index="overviewData.name"
                    @click="clickMenu(overviewData)">
        <i :class="overviewData.icon" />
        <span slot="title">{{overviewData.label}}</span>
      </el-menu-item>

      <el-submenu v-for="item in menuData"
                  :key="item.label"
                  :index="item.label">
        <template slot="title">
          <i :class="item.icon" />
          <span slot="title">{{item.label}}</span>
        </template>
        <el-menu-item v-for="subItem in item.children"
                      :key="subItem.name"
                      :index="subItem.name"
                      @click="clickMenu(subItem)">{{subItem.label}}
        </el-menu-item>
      </el-submenu>

    </el-menu>
  </el-col>
</template>
<style lang="less" scoped>
.el-col {
  height: 100%;
  width: 100%;
  .menu {
    height: 100%;
    h4 {
      text-align: center;
    }
    .logo {
      padding-top: 10px;
    }
  }
  .menu:not(.el-menu--collapse) {
    width: 200px;
    height: 100%;
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
      collapseIcon: 'el-icon-s-fold',
      //左侧菜单项目动态储存在这里，方便权限管理
      overviewData: {
        path: '/overview',
        name: 'main',
        label: '总览',
        icon: 'el-icon-s-home',
      },
      menuData: [
        {
          label: '资源信息',
          icon: 'el-icon-wind-power',
          children: [
            {
              path: '/wind',
              name: 'wind',
              label: '风资源',
            },
            {
              path: '/terrain',
              name: 'terrain',
              label: '地形数据',
            },
            {
              path: '/turbine',
              name: 'turbine',
              label: '风机信息',
            },
          ],
        },
        {
          label: '仿真优化',
          icon: 'el-icon-data-line',
          children: [
            {
              path: '/simulation',
              name: 'simulation',
              label: '发电仿真',
            },
            {
              path: '/optimize',
              name: 'optimize',
              label: '优化控制',
            },
            {
              path: '/load',
              name: 'load',
              label: '载荷分析',
            },
          ],
        },
        {
          label: '管理系统',
          icon: 'el-icon-document',
          children: [
            {
              path: '/cluster',
              name: 'cluster',
              label: '集群管理',
            },
            {
              path: '/people',
              name: 'people',
              label: '人员管理',
            },
          ],
        },
      ],
    }
  },
  methods: {
    changeCollapse() {
      this.$store.commit('COLLAPSE_MENU')
      this.collapseIcon = this.isCollapse
        ? 'el-icon-s-unfold'
        : 'el-icon-s-fold'
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
