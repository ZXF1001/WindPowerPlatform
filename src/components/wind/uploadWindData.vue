<template>
  <div>
    <!-- 上传文件 -->
    <el-upload ref="upload"
               action="#"
               accept=".csv"
               :show-file-list="false"
               :auto-upload="false"
               :on-change="handleChange">
      <el-button slot="trigger"
                 type="primary"
                 size="medium"
                 plain>{{selectBtnContent}}</el-button>
      <span class="filename"
            v-show="fileName"><i class="el-icon-document" /> {{fileName}}</span>
      <el-button style="position:absolute;right:0"
                 size="medium"
                 @click="test">test</el-button>
    </el-upload>
    <div v-if="headerData.length>0">
      <!-- 显示csv为表格 -->
      <div>
        <el-divider content-position="left">前十行预览（共{{firstLineAsHeader?jsonData.length-1:jsonData.length}}行）</el-divider>
        <el-checkbox v-model="firstLineAsHeader"
                     @change="showAsTable(jsonData.slice(0, 10))">第一行数据作为表头</el-checkbox>
        <el-table :data="tableData"
                  height="calc(50vh - 170px)"
                  border
                  fit
                  :key="sTable"
                  style="width: 100%">
          <el-table-column v-for="item in headerData"
                           :key="item.prop"
                           :prop="item.prop"
                           :label="item.label" />
        </el-table>
      </div>
      <el-divider content-position="left">数据设置</el-divider>
      <el-row>
        <el-col :span="12">
          <div class="left">
            <!-- 显示所有字段并选择要上传的字段 -->
            <el-table :data="headerListData"
                      height="calc(50vh - 150px)"
                      border
                      fit
                      @selection-change="(val)=>{multipleSelection = val}">
              <el-table-column type="selection" />
              <el-table-column prop="dataHeader"
                               label="字段" />
              <el-table-column label="字段类型">
                <template slot-scope="scope">

                  <el-cascader v-model="scope.row.typeOptions"
                               :options="typeOptions"
                               :disabled="casaderDisabled(scope.row.index)"
                               :show-all-levels="false"
                               :props="{ expandTrigger: 'hover' }" />
                </template>
              </el-table-column>
              <el-table-column prop="height"
                               label="高度/[m]">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.height"
                            v-show="!(casaderDisabled(scope.row.index)||heightInputDisabled(scope.row.typeOptions))"
                            placeholder="请输入高度" />
                </template>

              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <el-card class="right"
                   shadow="never">
            <!-- 显示数据信息的设置 -->
            <el-form :inline="true">
              <el-form-item label="测风数据编号（仅支持英文与数字）">
                <el-input v-model="siteInfo"
                          placeholder="请输入编号"></el-input>
              </el-form-item>
            </el-form>
            <!-- 上传按钮 -->
            <el-button type="primary"
                       :loading="uploadButtonLoading"
                       plain
                       size="medium"
                       class="bottom"
                       :disabled="uploadButtonDisabled"
                       @click="submitUpload">{{uploadButtonContent}}</el-button>

          </el-card>
        </el-col>
      </el-row>

    </div>
  </div>
</template>

<script>
import Papa from 'papaparse'
import { createTable, upload2DB } from '@/api/wind/uploadData'
export default {
  data() {
    return {
      selectBtnContent: '选取文件',
      fileName: null, //显示的文件名
      firstLineAsHeader: true, //第一行数据是否为表头
      jsonData: [], //转换得到的json格式数据
      headerData: [], //形如[{prop:"time",label:"time"},{prop:"velocity",label:"velocity"}]
      tableData: [], //形如[{time:"10:00",velocity:9.8},{...},...]
      headerListData: [], //形如[{dataHeader:header1OfCsv},{...},...]
      sTable: 1, //为了加入表的key来刷新表的高度
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
      uploadButtonContent: '上传',
      uploadButtonDisabled: false,
      uploadButtonLoading: false,
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
    test() {
      this.multipleSelection = [
        {
          index: 0,
          dataHeader: 'date',
          typeOptions: ['datetime', 'date'],
          height: null,
        },
        {
          index: 1,
          dataHeader: 'time',
          typeOptions: ['datetime', 'time'],
          height: null,
        },
        {
          index: 2,
          dataHeader: '70m_v_avg',
          typeOptions: ['v', 'avg'],
          height: '70',
        },
        {
          index: 4,
          dataHeader: '70m_v_max',
          typeOptions: ['v', 'max'],
          height: '70',
        },
        {
          index: 5,
          dataHeader: '70m_v_min',
          typeOptions: ['v', 'min'],
          height: '70',
        },
        {
          index: 6,
          dataHeader: '60m_v_avg',
          typeOptions: ['v', 'avg'],
          height: '60',
        },
        {
          index: 8,
          dataHeader: '60m_v_max',
          typeOptions: ['v', 'max'],
          height: '60',
        },
        {
          index: 9,
          dataHeader: '60m_v_min',
          typeOptions: ['v', 'min'],
          height: '60',
        },
        {
          index: 10,
          dataHeader: '40m_v_avg',
          typeOptions: ['v', 'avg'],
          height: '40',
        },
        {
          index: 12,
          dataHeader: '40m_v_max',
          typeOptions: ['v', 'max'],
          height: '40',
        },
        {
          index: 13,
          dataHeader: '40m_v_min',
          typeOptions: ['v', 'min'],
          height: '40',
        },
        {
          index: 14,
          dataHeader: '10m_v_avg',
          typeOptions: ['v', 'avg'],
          height: '10',
        },
        {
          index: 16,
          dataHeader: '10m_v_max',
          typeOptions: ['v', 'max'],
          height: '10',
        },
        {
          index: 17,
          dataHeader: '10m_v_min',
          typeOptions: ['v', 'min'],
          height: '10',
        },
        {
          index: 18,
          dataHeader: '70m_deg_avg',
          typeOptions: ['deg', 'avg'],
          height: '70',
        },
        {
          index: 20,
          dataHeader: '70m_deg_max',
          typeOptions: ['deg', 'max'],
          height: '70',
        },
        {
          index: 21,
          dataHeader: '70m_deg_min',
          typeOptions: ['deg', 'min'],
          height: '70',
        },
        {
          index: 22,
          dataHeader: '40m_deg_avg',
          typeOptions: ['deg', 'avg'],
          height: '40',
        },
        {
          index: 24,
          dataHeader: '40m_deg_max',
          typeOptions: ['deg', 'max'],
          height: '40',
        },
        {
          index: 25,
          dataHeader: '40m_deg_min',
          typeOptions: ['deg', 'min'],
          height: '40',
        },
        {
          index: 26,
          dataHeader: '10m_deg_avg',
          typeOptions: ['deg', 'avg'],
          height: '10',
        },
        {
          index: 28,
          dataHeader: '10m_deg_max',
          typeOptions: ['deg', 'max'],
          height: '10',
        },
        {
          index: 29,
          dataHeader: '10m_deg_min',
          typeOptions: ['deg', 'min'],
          height: '10',
        },
      ]
    },
    handleChange() {
      this.selectBtnContent = '重新选取'
      if (this.$refs.upload.uploadFiles.length !== 0) {
        if (this.$refs.upload.uploadFiles.length > 1) {
          //如再次选择，选取最新的文件
          this.$refs.upload.uploadFiles.shift()
        }
        //把选择的csv文件显示在页面上
        this.fileName = this.$refs.upload.uploadFiles[0].name
        this.siteInfo = this.fileName.split('.')[0]
        var selectedFile = this.$refs.upload.uploadFiles[0].raw
        try {
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
                this.showAsTable(this.jsonData.slice(0, 10)) //显示为表格
              },
            })
          }
        } catch (error) {
          this.$alert('文件读取错误，请检查文件格式！', '错误', {
            confirmButtonText: '确定',
            type: 'error',
            showClose: false,
          })
        }
      }

      function checkEncoding(base64Str) {
        // 返回编码方式
        var str = atob(base64Str.split(';base64,')[1])
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
      ++this.sTable //这是为了刷新一下表格，避免高度改变后出现空白区域
      this.headerData = []
      this.tableData = []
      this.headerListData = []
      if (this.jsonData.length > 0) {
        jsonData[0].forEach((element, index) => {
          this.headerData.push({
            prop: index.toString(),
            label: this.firstLineAsHeader ? element : index.toString(),
          })
          this.headerListData.push({
            index: index,
            dataHeader: this.firstLineAsHeader ? element : index.toString(),
            typeOptions: null,
            height: null,
          })
        })
        for (let i = this.firstLineAsHeader ? 1 : 0; i < jsonData.length; i++) {
          var tableRecord = {}
          jsonData[i].forEach((record, index) => {
            tableRecord[this.headerData[index].prop] = record
          })
          this.tableData.push(tableRecord)
        }
      }
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
      try {
        var data = JSON.parse(JSON.stringify(this.jsonData))
        if (this.firstLineAsHeader) {
          data.shift()
        }
        //检验是否有空的选择框
        this.multipleSelection.forEach((element) => {
          if (element.typeOptions === null) {
            throw '空的选择框'
          }
        })

        var fieldData = JSON.parse(JSON.stringify(this.multipleSelection))
        const fieldList = fieldData.map((item) => item.typeOptions[1])
        const datetimeExist = fieldList.indexOf('datetime') !== -1
        const dateExist = fieldList.indexOf('date') !== -1
        const timeExist = fieldList.indexOf('time') !== -1
        //以下为日期拼接的前处理（若需要拼接）
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
            throw '缺少日期时间字段'
          }
        }

        //检验是否有空的高度行
        this.multipleSelection.forEach((element) => {
          if (
            element.typeOptions[0] === 'v' ||
            element.typeOptions[0] === 'deg'
          ) {
            if (element.height === null) {
              throw '请输入高度'
            }
          }
        })
        //检验完毕，没有错误就上传

        var uploadData = []
        //上传的时候把字段格式改成规范的形式（如70m_v_avg）
        data.forEach((line) => {
          var tempRecord = {}
          fieldData.forEach((field) => {
            //如果是速度/角度字段,前面要加上高度
            if (
              field.typeOptions[0] === 'v' ||
              field.typeOptions[0] === 'deg'
            ) {
              tempRecord[
                `${field.height}m_${field.typeOptions[0]}_${field.typeOptions[1]}`
              ] = line[field.index]
            } else {
              tempRecord[field.typeOptions[1]] = line[field.index]
            }
          })
          uploadData.push(tempRecord)
        })
        //创建数据表
        createTable({ site: this.siteInfo, data: uploadData[0] })
          .then(async () => {
            try {
              const MAX_RECORD_NUM = Math.round(30000 / fieldData.length) //分块上传，每块上传30000个数据（不是条，是个）
              const uploadNum = Math.ceil(uploadData.length / MAX_RECORD_NUM)
              console.log(`单次上传${MAX_RECORD_NUM}条`)
              this.uploadButtonDisabled = true
              for (var i = 0; i < uploadNum; i++) {
                var postData = {
                  site: this.siteInfo,
                  data: uploadData.slice(
                    i * MAX_RECORD_NUM,
                    (i + 1) * MAX_RECORD_NUM
                  ),
                }

                await upload2DB(postData)
                this.uploadButtonLoading = true
                this.uploadButtonContent = `${Math.round(
                  (100 * i) / (uploadNum - 1)
                )}%`
                console.log(i)
                console.log(postData.data.length)
              }
              this.$alert('上传完成', '提示', {
                confirmButtonText: '确定',
                type: 'success',
                showClose: false,
              })
            } catch (error) {
              this.$alert('上传失败，请检查重试', '错误', {
                confirmButtonText: '确定',
                type: 'error',
                showClose: false,
              })
              console.log(error)
            } finally {
              this.uploadButtonContent = '上传'
              this.uploadButtonDisabled = false
              this.uploadButtonLoading = false
            }
          })
          .catch((e) => {
            this.$alert('创建数据表失败，请检查站点名是否已存在', '错误', {
              confirmButtonText: '确定',
              type: 'error',
              showClose: false,
            })
            console.log(e)
          })
      } catch (error) {
        this.$alert(error, '错误', {
          confirmButtonText: '确定',
          type: 'error',
          showClose: false,
        })
      }
    },
  },
}
</script>
<style lang="less" scoped>
.filename {
  margin-left: 10px;
  font-size: 14px;
}
.left {
  padding-right: 10px;
}
.right {
  height: calc(50vh - 150px);
  .bottom {
    position: absolute;
    bottom: 20px;
  }
}
</style>