<template>
  <el-tabs v-model="activeName"
           :before-leave="beforeTagsLeave">

    <el-tab-pane label="测试"
                 name="test"
                 :lazy="true">
      <test v-if="existList.test" />
    </el-tab-pane>

  </el-tabs>
</template>
<script>
import test from '@/components/terrain/test.vue'
export default {
  components: {
    test,
  },
  data() {
    return {
      activeName: 'test',
      // activeName: 'websocketTest',
      existList: {
        test: true,
      },
    }
  },
  methods: {
    beforeTagsLeave(newTab, oldTab) {
      this.existList[newTab] = true
      this.existList[oldTab] = false
    },
  },
}
</script>