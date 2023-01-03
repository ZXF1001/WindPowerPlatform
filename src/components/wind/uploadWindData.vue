<template>
  <div>

    <div class="selectFile">
      <el-upload ref="upload"
                 action="#"
                 accept=".csv"
                 :show-file-list="false"
                 :file-list="fileList"
                 :auto-upload="false"
                 :on-change="handleChange">
        <el-button slot="trigger"
                   type="primary">选取文件</el-button>
      </el-upload>

      <!-- 显示csv为表格 -->
      <div v-show="headerData.length>0">
        <p>前五行数据预览</p>
        <el-checkbox v-model="firstLineAsHeader"
                     @change="showAsTable(jsonData.slice(0, 5))">第一行数据作为表头</el-checkbox>
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
      <!-- 显示所有字段并选择要上传的字段 -->
      <el-table :data="headerListData"
                max-height="400"
                border
                fit
                @selection-change="handleSelectionChange"
                style="width:40%">
        <el-table-column type="selection" />
        <el-table-column prop="dataHeader"
                         label="字段" />
        <el-table-column label="字段类型">
          <template slot-scope="scope">

            <el-cascader v-model="scope.row.typeOptions"
                         :options="typeOptions"
                         :disabled="casaderDisabled(scope.row.index)"></el-cascader>
          </template>
        </el-table-column>
        <el-table-column prop="height"
                         label="高度/[m]">
          <template slot-scope="scope">
            <el-input v-model="scope.row.height"
                      :disabled="casaderDisabled(scope.row.index)||heightInputDisabled(scope.row.typeOptions)"
                      placeholder="请输入内容"></el-input>
          </template>

        </el-table-column>
      </el-table>

      <!-- 显示数据信息的设置 -->
      <el-input v-model="siteInfo"
                placeholder="请输入站点"></el-input>
      <!-- 上传按钮 -->
      <el-button type="success"
                 @click="submitUpload">上传到服务器</el-button>
    </div>

  </div>
</template>

<script>
import Papa from 'papaparse'
import { createTable, upload2DB } from '@/api/wind/uploadData'
export default {
  data() {
    return {
      fileList: [],
      firstLineAsHeader: true, //第一行数据是否为表头
      jsonData: [],
      headerData: [], //形如[{prop:"time",label:"time"},{prop:"velocity",label:"velocity"}]
      tableData: [], //形如[{time:"10:00",velocity:9.8},{...},...]
      headerListData: [], //形如[{dataHeader:header1OfCsv},{...},...]
      typeOptions: [
        {
          value: 'datetime',
          label: '日期时间',
          children: [
            {
              value: 'datetime',
              label: '日期+时间',
            },
            { value: 'date', label: '日期' },
            { value: 'time', label: '时间' },
          ],
        },

        {
          value: 'v',
          label: '速度字段',
          children: [
            {
              value: 'avg',
              label: '平均速度',
            },
            {
              value: 'max',
              label: '最大速度',
            },
            {
              value: 'min',
              label: '最小速度',
            },
          ],
        },
        {
          value: 'deg',
          label: '风向角字段',
          children: [
            {
              value: 'avg',
              label: '平均风向角',
            },
            {
              value: 'max',
              label: '最大风向角',
            },
            {
              value: 'min',
              label: '最小风向角',
            },
          ],
        },
      ],
      multipleSelection: [],
      siteInfo: '',
    }
  },
  computed: {
    casaderDisabled() {
      return function (index) {
        return (
          this.multipleSelection.map((item) => item.index).indexOf(index) === -1
        )
      }
    },
    heightInputDisabled() {
      return function (typeOptions) {
        return typeOptions === null || typeOptions[0] === 'datetime'
      }
    },
  },
  methods: {
    handleChange() {
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
              this.jsonData = data
              this.showAsTable(this.jsonData.slice(0, 5)) //显示为表格
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
      if (this.jsonData.length > 0) {
        if (this.firstLineAsHeader) {
          //第一行数据作为表头
          jsonData[0].forEach((element, index) => {
            this.headerData.push({ prop: index.toString(), label: element })
            this.headerListData.push({
              index: index,
              dataHeader: element,
              typeOptions: null,
              height: null,
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
              dataHeader: index.toString(),
              typeOptions: null,
              height: null,
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
    },
    submitUpload() {
      // 要把上传的数据变成
      // [{
      //   datetime:"2022-12-23 11:40:00",
      //   70m_v_avg:9.8,
      // },
      // {
      //   ...
      // },
      // ...]
      // 这样的形式
      var data = JSON.parse(JSON.stringify(this.jsonData))
      if (this.firstLineAsHeader) {
        data.shift()
      }
      var fieldData = JSON.parse(JSON.stringify(this.multipleSelection))
      const fieldList = fieldData.map((item) => item.typeOptions[1])
      const datetimeExist = fieldList.indexOf('datetime') !== -1
      const dateExist = fieldList.indexOf('date') !== -1
      const timeExist = fieldList.indexOf('time') !== -1
      if (datetimeExist) {
        //过滤multi列表里的d和t
        fieldData = fieldData.filter(
          (item) =>
            item.typeOptions[1] !== 'date' && item.typeOptions[1] !== 'time'
        )
      } else {
        if (dateExist && timeExist) {
          //把d和t拼成一个dt,再删掉d和t
          //修改字段表数据
          fieldData.push({
            index: data[0].length,
            typeOptions: ['datetime', 'datetime'],
          })
          //找到时间日期所在的index,并合并加到dt字段
          var indexOfDate = fieldData.filter(
            (item) => item.typeOptions[1] === 'date'
          )[0].index
          var indexOfTime = fieldData.filter(
            (item) => item.typeOptions[1] === 'time'
          )[0].index
          data.forEach((line) => {
            var datetime = `${line[indexOfDate]} ${line[indexOfTime]}`
            line.push(datetime)
          })
          //删除字段表的d,t信息
          fieldData = fieldData.filter(
            (item) =>
              item.typeOptions[1] !== 'date' && item.typeOptions[1] !== 'time'
          )
        } else {
          //报错:没有日期时间
          alert('没有日期时间数据')
        }
      }
      var uploadData = []
      data.forEach((line) => {
        //每一行jsondata的操作

        var tempRecord = {}
        fieldData.forEach((field) => {
          //字段选择表中每个选中字段的操作
          //查找有没有date/time/datetime字段

          //如果是速度/角度字段,前面要加上高度
          if (field.typeOptions[0] === 'v' || field.typeOptions[0] === 'deg') {
            tempRecord[
              `${field.height}m_${field.typeOptions[0]}_${field.typeOptions[1]}`
            ] = line[field.index]
          } else {
            tempRecord[field.typeOptions[1]] = line[field.index]
          }
        })
        uploadData.push(tempRecord)
      })
      createTable({ site: this.siteInfo, data: uploadData[0] }).then((res) => {
        const max_length = 1000
        for (var i = 0; i < Math.floor(uploadData.length / max_length); i++) {
          upload2DB({
            site: this.siteInfo,
            data: uploadData.slice(i * max_length, (i + 1) * max_length),
          }).then((res) => {
            console.log(res)
          })
        }
        upload2DB({
          site: this.siteInfo,
          data: uploadData.slice(i * max_length),
        }).then((res) => {
          console.log(res)
        })
      })
    },
  },
}
</script>
<style lang="less" scoped>
</style>