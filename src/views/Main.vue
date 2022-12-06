<template>
  <div>
    <el-container>
      <el-aside width="190px">
        <common-aside></common-aside>
      </el-aside>
      <el-container>
        <el-header>
          <common-header></common-header>
        </el-header>
        <el-main>
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="less" scoped>
.el-header {
  padding: 0;
}
.el-container,
.el-main {
  height: 100vh;
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