<template>
  <div class="header-container">
    <div class="l-content">
      <h2 style="color:#fff">风电场规划设计优化运行系统化云计算平台</h2>
    </div>
    <div class="r-content">
      <div class="nowtime">
        <h3 style="color:#fff">{{date}}</h3>
      </div>
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
import dateFormatter from '@/utils/dateFormatter'
export default {
  data() {
    return {
      date: null,
    }
  },
  methods: {
    updateFormatDate() {
      this.timer = setInterval(() => {
        this.date = dateFormatter(new Date(), 'Chinese')
      }, 1000)
    },
  },
  mounted() {
    this.date = dateFormatter(new Date(), 'Chinese')
    this.updateFormatDate()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
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
  .r-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .nowtime {
      margin-right: 40px;
    }
  }
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