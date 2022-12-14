<template>
  <div class="header-container">
    <div class="l-content">
      <!-- 展开菜单栏的按钮，用不到 -->
      <!-- <el-button icon="el-icon-menu"
                 size="mini"
                 @click="handleMenu"></el-button> -->
      <!-- 面包屑 -->

      <h2 style="color:#fff">虚拟激光雷达区域化风电场优化云计算平台</h2>
    </div>
    <div class="r-content">
      <el-dropdown>
        <span class="el-dropdown-link">
          <img class="user"
               src="../assets/images/user.png">
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>个人信息</el-dropdown-item>
          <el-dropdown-item>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    handleMenu() {
      this.$store.commit('collapseMenu')
    },
  },
}
</script>

<style lang="less" scoped>
.header-container {
  background-color: rgb(64, 158, 255);
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .text {
    color: #fff;
    font-size: 14px;
    margin-left: 14px;
  }
  .r-content {
    .user {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
}
</style>