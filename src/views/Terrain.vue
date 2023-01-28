<template>
  <el-tabs v-model="activeName"
           :before-leave="beforeTagsLeave">

    <el-tab-pane label="demo"
                 name="demo"
                 :lazy="true">
      <demo v-if="existList.demo" />
    </el-tab-pane>
    <el-tab-pane label="地形测试"
                 name="test"
                 :lazy="true">
      <test v-if="existList.test" />
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import demo from '@/components/terrain/demo.vue'
import test from '@/components/terrain/test.vue'
export default {
  components: {
    demo,
    test,
  },
  data() {
    return {
      activeName: 'demo',
      existList: {
        demo: false,
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