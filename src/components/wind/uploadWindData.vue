<template>
  <div>

    <div class="selectFile">
      <el-upload ref="upload"
                 action="#"
                 accept=".csv"
                 :show-file-list="false"
                 drag
                 :file-list="fileList"
                 :auto-upload="false"
                 :on-change="handleChange">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em>
          <div class="el-upload__tip">（仅支持.csv格式）</div>
        </div>

      </el-upload>
      <!-- 显示所有字段并选择要上传的字段 -->
      <el-table :data="headerListData"
                max-height="400"
                border
                fit
                @selection-change="handleSelectionChange"
                style="width:40%">
        <el-table-column type="selection" />
        <el-table-column prop="index"
                         label="序号"
                         width="60" />
        <el-table-column prop="dataHeader"
                         label="字段" />

        <el-table-column label="字段类型">
          <template slot-scope="scope">
            <el-select v-model="scope.row.typeOptions"
                       placeholder="请选择"
                       :disabled="(multipleSelection.map(item=>item.index).indexOf(scope.row.index))===-1">
              <el-option v-for="item in typeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <!-- 显示csv为表格 -->
      <div v-show="headerData.length>0">
        <p>前五行数据预览</p>
        <el-checkbox v-model="firstLineAsHeader"
                     @change="showAsTable(jsonData10Lines)">第一行数据作为表头</el-checkbox>
        <el-table :data="tableData"
                  max-height="300"
                  border
                  fit
                  style="width: 100%">
          <el-table-column v-for="item in headerData"
                           :key="item.prop"
                           :prop="item.prop"
                           :label="item.label" />
        </el-table>
      </div>
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
    return {
      fileList: [],
      firstLineAsHeader: true, //第一行数据是否为表头
      jsonData10Lines: [],
      headerData: [], //形如[{prop:"time",label:"time"},{prop:"velocity",label:"velocity"}]
      tableData: [], //形如[{time:"10:00",velocity:9.8},{...},...]
      headerListData: [], //形如[{dataHeader:header1OfCsv},{...},...]
      typeOptions: [
        { value: 0, label: '日期' },
        { value: 1, label: '时间' },
        { value: 2, label: '速度' },
      ],
      multipleSelection: [],
    }
  },

  methods: {
    handleChange() {
      console.log('change')
      if (this.$refs.upload.uploadFiles.length !== 0) {
        if (this.$refs.upload.uploadFiles.length > 1) {
          this.$refs.upload.uploadFiles.shift()
        }
        //把选择的csv文件显示在页面上
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
              this.jsonData10Lines = data.slice(0, 5)
              this.showAsTable(this.jsonData10Lines) //显示为表格
            },
          })
        }
      }

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
    },
    showAsTable(jsonData) {
      this.headerData = []
      this.tableData = []
      this.headerListData = []
      if (this.jsonData10Lines.length > 0) {
        if (this.firstLineAsHeader) {
          //第一行数据作为表头
          jsonData[0].forEach((element, index) => {
            this.headerData.push({ prop: index.toString(), label: element })
            this.headerListData.push({
              index: index,
              typeOptions: null,
              dataHeader: element,
            })
          })
          for (let i = 1; i < jsonData.length; i++) {
            var tableRecord = {}
            jsonData[i].forEach((record, index) => {
              tableRecord[this.headerData[index].prop] = record
            })
            this.tableData.push(tableRecord)
          }
        } else {
          //第一行是数据
          jsonData[0].forEach((element, index) => {
            this.headerData.push({
              prop: index.toString(),
              label: index.toString(),
            })
            this.headerListData.push({
              index: index,
              typeOptions: null,
              dataHeader: index.toString(),
            })
          })
          for (let i = 0; i < jsonData.length; i++) {
            var tableRecord = {}
            jsonData[i].forEach((record, index) => {
              tableRecord[this.headerData[index].prop] = record
            })
            this.tableData.push(tableRecord)
          }
        }
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },
    submitUpload() {
      console.log('upload')
    },
  },
}
</script>
<style lang="less" scoped>
</style>