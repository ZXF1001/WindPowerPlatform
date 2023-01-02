<template>
  <div>
    <!-- <el-steps :active="1"
              simple>
      <el-step title="上传数据文件"
               icon="el-icon-folder-opened" />
      <el-step title="文件格式设置"
               icon="el-icon-edit-outline" />
      <el-step title="数据信息设置"
               icon="el-icon-document" />
      <el-step title="提交到数据库"
               icon="el-icon-upload" />
    </el-steps> -->

    <div class="selectFile">
      <el-upload ref="upload"
                 action="#"
                 multiple
                 accept=".csv"
                 :file-list="fileList"
                 :auto-upload="false">
        <el-button slot="trigger"
                   size="small"
                   type="primary">选取文件</el-button>

        <div slot="tip"
             class="el-upload__tip">提示文字</div>

      </el-upload>

      <el-button size="small"
                 type="success"
                 @click="submitUpload">上传到服务器</el-button>
    </div>

  </div>
</template>

<script>
import Papa from 'papaparse'
export default {
  data() {
    return { fileList: [] }
  },
  methods: {
    submitUpload() {
      function checkEncoding(base64Str) {
        // 返回编码方式
        var str = atob(base64Str.split(';base64,')[1])
        // console.log(str)
        // 要用二进制格式
        const jschardet = require('jschardet')
        var encoding = jschardet.detect(str)
        encoding = encoding.encoding
        // console.log( encoding );
        if (encoding === 'windows-1252') {
          // 有时会识别错误（如UTF8的中文二字）
          encoding = 'ANSI'
        }
        return encoding
      }
      var selectedFile = null
      selectedFile = this.$refs.upload.uploadFiles[0].raw
      var reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      reader.onload = (evt) => {
        // 检查编码
        let encoding = checkEncoding(evt.target.result)
        // 将csv转换成二维数组
        Papa.parse(selectedFile, {
          encoding: encoding,
          complete: (res) => {
            let data = res.data
            if (data[data.length - 1] == '') {
              //去除最后的空行
              data.pop()
            }
            console.log(data) // data就是文件里面的数据
          },
        })
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
  },
}
</script>
<style lang="less" scoped>
</style>