<template>
  <div>
    <h1>总览</h1>
    <el-row>
      <el-col :span="8">
        <div class="grid-content bg-purple"
             style="margin-right:10px">
          <!-- 左栏 -->

          <div class="num-info">
            <!-- 左上的数字 -->
            <div class="row">
              <el-card>
                <p class="label">运行中台数</p>
                <p class="num">45</p>
              </el-card>
              <el-card>
                <p class="label">总台数</p>
                <p class="num">60</p>
              </el-card>
            </div>
            <div class="row">
              <el-card>
                <p class="label">优化前功率</p>
                <p class="num">48.98MW</p>
              </el-card>
              <el-card>
                <p class="label">优化后功率</p>
                <p class="num">53.71MW</p>
              </el-card>
            </div>
          </div>
          <el-card>
            <!-- 左下的表格 -->

          </el-card>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content bg-purple-light">
          <!-- 右栏 -->
          <el-card>
            <!-- 右上的地图 -->
          </el-card>
          <el-card>
            <!-- 右下的线图 -->
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<style lang="less" scoped>
.num-info {
  .row {
    display: flex;
    justify-content: space-between;
    .el-card {
      width: 48%;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      padding: 1px;
      .label {
        text-align: center;
        margin-top: 0;
      }
      .num {
        text-align: center;
        font-size: 30px;
        margin-bottom: 0px;
        margin-top: 0px;
      }
    }
  }
}
</style>
<script>
export default {
  data() {
    return {}
  },
}
</script>