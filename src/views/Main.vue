<template>
  <el-container>
    <el-header>
      <common-header />
    </el-header>
    <el-container>
      <el-aside width="auto">
        <common-aside />
      </el-aside>
      <el-main class="scroller-large">
        <!-- <keep-alive> -->
        <router-view />
        <!-- </keep-alive> -->
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="less" scoped>
.el-container,
.el-main,
.el-aside {
  // 与CommonAside中的el-menu配合使用
  height: calc(100vh - 60px);
}
.el-header {
  padding: 0;
}
</style>

<script>
import CommonAside from '../components/CommonAside.vue'
import CommonHeader from '../components/CommonHeader.vue'
export default {
  data() {
    return {}
  },
  components: {
    CommonAside,
    CommonHeader,
  },
}
</script>