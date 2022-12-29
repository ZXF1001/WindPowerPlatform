<template>

  <el-container>
    <el-header>
      <common-header></common-header>
    </el-header>
    <el-container>
      <el-aside width="150px">
        <common-aside></common-aside>
      </el-aside>
      <el-main>
        <!-- <keep-alive> -->
        <router-view></router-view>
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