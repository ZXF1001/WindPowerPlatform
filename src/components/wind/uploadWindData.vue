<template>
  <div v-if="refresh">
    <!-- 上传文件 -->
    <el-upload
      ref="upload"
      :drag="!fileName"
      action="#"
      accept=".csv"
      :show-file-list="false"
      :auto-upload="false"
      :on-change="handleChange"
    >
      <div class="dragDiv" v-if="!fileName">
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将.csv文件拖到此处，或<em>点击上传</em>
        </div>
      </div>

      <div style="text-align: left" v-if="fileName">
        <el-button slot="trigger" type="primary" size="medium" plain>{{
          selectBtnContent
        }}</el-button>
        <span class="filename" v-show="fileName"
          ><i class="el-icon-document" /> {{ fileName }}</span
        >
        <el-button
          style="position: absolute; right: 0"
          size="medium"
          @click="test"
          >test</el-button
        >
      </div>
    </el-upload>
    <div v-if="headerData.length > 0">
      <!-- 显示csv为表格 -->
      <div>
        <el-divider content-position="left"
          >前十行预览（共{{
            firstLineAsHeader ? jsonData.length - 1 : jsonData.length
          }}行）</el-divider
        >
        <el-checkbox
          v-model="firstLineAsHeader"
          @change="showAsTable(jsonData.slice(0, 10))"
          >第一行数据作为表头</el-checkbox
        >
        <el-table
          :data="tableData"
          height="calc(50vh - 170px)"
          border
          fit
          :key="tableKey1"
          style="width: 100%"
        >
          <el-table-column
            v-for="item in headerData"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
          />
        </el-table>
      </div>
      <el-divider content-position="left">数据设置</el-divider>
      <el-row>
        <el-col :span="12">
          <div class="left">
            <!-- 显示所有字段并选择要上传的字段 -->
            <el-table
              :data="headerListData"
              height="calc(50vh - 150px)"
              border
              fit
              @selection-change="
                (val) => {
                  multipleSelection = val;
                }
              "
            >
              <el-table-column type="selection" />
              <el-table-column prop="dataHeader" label="字段" />
              <el-table-column label="字段类型">
                <template slot-scope="typeScope">
                  <el-cascader
                    v-model="typeScope.row.typeOptions"
                    :options="typeOptions"
                    :disabled="casaderDisabled(typeScope.row.index)"
                    :show-all-levels="false"
                    :props="{ expandTrigger: 'hover' }"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="height" label="高度/[m]">
                <template slot-scope="heightScope">
                  <el-input
                    v-model="heightScope.row.height"
                    v-show="
                      !(
                        casaderDisabled(heightScope.row.index) ||
                        heightInputDisabled(heightScope.row.typeOptions)
                      )
                    "
                    placeholder="请输入高度"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <el-card class="right" shadow="never">
            <!-- 显示数据信息的设置 -->
            <el-form>
              <el-form-item label="测风数据编号（仅支持英文与数字）">
                <div class="inputBox">
                  <el-input v-model="siteInfo" placeholder="请输入编号" />
                </div>
              </el-form-item>
            </el-form>
            <!-- 上传按钮 -->
            <el-button
              type="primary"
              :loading="uploadButtonLoading"
              plain
              size="medium"
              class="bottom"
              :disabled="uploadButtonDisabled"
              @click="submitUpload"
            >
              {{ uploadButtonContent }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { createTable, upload2DB } from "@/api/wind/uploadData";
import { readLocalCSV } from "@/utils/readCSV";
import { checkUpload } from "@/js/upload/checkRules";
export default {
  data() {
    return {
      refresh: true,
      selectBtnContent: "选取文件",
      fileName: null, //显示的文件名
      firstLineAsHeader: true, //第一行数据是否为表头
      jsonData: [], //转换得到的json格式数据
      headerData: [], //形如[{prop:"time",label:"time"},{prop:"velocity",label:"velocity"}]
      tableData: [], //形如[{time:"10:00",velocity:9.8},{...},...]
      headerListData: [], //形如[{dataHeader:header1OfCsv},{...},...]
      tableKey1: 1, //为了加入表的key来刷新表的高度
      typeOptions: [
        {
          value: "datetime",
          label: "日期时间",
          children: [
            {
              value: "datetime",
              label: "日期+时间",
            },
            { value: "date", label: "日期" },
            { value: "time", label: "时间" },
          ],
        },

        {
          value: "v",
          label: "速度字段",
          children: [
            {
              value: "avg",
              label: "平均速度",
            },
            {
              value: "max",
              label: "最大速度",
            },
            {
              value: "min",
              label: "最小速度",
            },
          ],
        },
        {
          value: "deg",
          label: "风向角字段",
          children: [
            {
              value: "avg",
              label: "平均风向角",
            },
            {
              value: "max",
              label: "最大风向角",
            },
            {
              value: "min",
              label: "最小风向角",
            },
          ],
        },
      ],
      multipleSelection: [],
      siteInfo: "",
      uploadButtonContent: "上传",
      uploadButtonDisabled: false,
      uploadButtonLoading: false,
    };
  },
  computed: {
    casaderDisabled() {
      return function (index) {
        return (
          this.multipleSelection.map((item) => item.index).indexOf(index) === -1
        );
      };
    },
    heightInputDisabled() {
      return function (typeOptions) {
        return typeOptions === null || typeOptions[0] === "datetime";
      };
    },
  },
  methods: {
    test() {},
    handleChange() {
      this.selectBtnContent = "重新选取";

      if (this.$refs.upload.uploadFiles.length > 1) {
        //如再次选择，选取最新的文件
        this.$refs.upload.uploadFiles.shift();
      }
      //把选择的csv文件显示在页面上
      this.fileName = this.$refs.upload.uploadFiles[0].name;
      this.siteInfo = this.fileName.split(".")[0];
      const selectedFile = this.$refs.upload.uploadFiles[0].raw;

      try {
        readLocalCSV(selectedFile, (res) => {
          const data = res.data;
          if (data[data.length - 1][0] === "") {
            data.pop();
          }
          this.jsonData = data;
          this.showAsTable(this.jsonData.slice(0, 10)); //显示为表格
        });
      } catch (error) {
        this.$alert("文件读取错误，请检查文件格式！", "错误", {
          confirmButtonText: "确定",
          type: "error",
          showClose: false,
        });
      }
    },

    showAsTable(jsonData) {
      ++this.tableKey1; //这是为了刷新一下表格，避免高度改变后出现空白区域
      this.headerData = [];
      this.tableData = [];
      this.headerListData = [];
      if (this.jsonData.length > 0) {
        for (let i = 0; i < jsonData[0].length; i++) {
          this.headerData.push({
            prop: i.toString(),
            label: this.firstLineAsHeader ? jsonData[0][i] : i.toString(),
          });
          this.headerListData.push({
            index: i,
            dataHeader: this.firstLineAsHeader ? jsonData[0][i] : i.toString(),
            typeOptions: null,
            height: null,
          });
        }
        for (let i = this.firstLineAsHeader ? 1 : 0; i < jsonData.length; i++) {
          const tableRecord = {};
          for (let j = 0; j < jsonData[i].length; j++) {
            tableRecord[this.headerData[j].prop] = jsonData[i][j];
          }
          this.tableData.push(tableRecord);
        }
      }
    },
    submitUpload() {
      function conventData(data, fieldData) {
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

        const uploadData = [];
        //上传的时候把字段格式改成规范的形式（如70m_v_avg）
        for (let i = 0; i < data.length; i++) {
          const tempRecord = {};
          for (let j = 0; j < fieldData.length; j++) {
            const field = fieldData[j];
            //如果是速度/角度字段,前面要加上高度
            if (
              field.typeOptions[0] === "v" ||
              field.typeOptions[0] === "deg"
            ) {
              tempRecord[
                `${field.height}m_${field.typeOptions[0]}_${field.typeOptions[1]}`
              ] = data[i][field.index];
            } else {
              tempRecord[field.typeOptions[1]] = data[i][field.index];
            }
          }
          uploadData.push(tempRecord);
        }
        console.log(uploadData);
        return uploadData;
      }

      try {
        let data = JSON.parse(JSON.stringify(this.jsonData));
        if (this.firstLineAsHeader) data.shift();

        // 深拷贝一份数据
        let fieldData = JSON.parse(JSON.stringify(this.multipleSelection));
        //* 先校验数据（封装的校验函数）

        ({ data, fieldData } = checkUpload(data, fieldData));

        //* 检验完毕，没有错误就上传
        const uploadData = conventData(data, fieldData);

        //创建数据表
        createTable({ site: this.siteInfo, data: uploadData[0] })
          .then(async () => {
            try {
              const MAX_RECORD_NUM = Math.round(30000 / fieldData.length); //分块上传，每块上传30000个数据（不是条，是个，这个可以根据服务器速度来调整）
              const uploadNum = Math.ceil(uploadData.length / MAX_RECORD_NUM);
              console.log(`单次上传${MAX_RECORD_NUM}条`);
              this.uploadButtonDisabled = true;
              for (let i = 0; i < uploadNum; i++) {
                const postData = {
                  site: this.siteInfo,
                  data: uploadData.slice(
                    i * MAX_RECORD_NUM,
                    (i + 1) * MAX_RECORD_NUM
                  ),
                };

                const res = await upload2DB(postData);
                console.log(res);
                var totalNum = res.data.totalNum;

                this.uploadButtonLoading = true;
                this.uploadButtonContent = `${Math.round(
                  (100 * i) / (uploadNum - 1)
                )}%`;
                console.log(i);
              }
              this.$alert(`上传成功，共上传${totalNum}条记录`, "提示", {
                confirmButtonText: "确定",
                type: "success",
                showClose: false,
                callback: () => {
                  this.$emit("refresh");
                },
              });
            } catch (e) {
              const errorText = e.response.data;
              this.$alert(errorText, "错误", {
                confirmButtonText: "确定",
                type: "error",
                showClose: false,
              });
              console.error(e);
            } finally {
              this.uploadButtonContent = "上传";
              this.uploadButtonDisabled = false;
              this.uploadButtonLoading = false;
            }
          })
          .catch((e) => {
            this.$alert("创建数据表失败，请检查站点名是否已存在", "错误", {
              confirmButtonText: "确定",
              type: "error",
              showClose: false,
            });
            console.log(e);
          });
      } catch (error) {
        this.$alert(error, "错误", {
          confirmButtonText: "确定",
          type: "error",
          showClose: false,
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
/deep/.el-upload {
  width: 100%;
}
/deep/.el-upload-dragger {
  @main_height: calc(100vh - 160px);
  width: 100%;
  height: @main_height;
  .dragDiv {
    margin-top: calc(@main_height / 2 - 100px);
  }
}
.filename {
  margin-left: 10px;
  font-size: 14px;
}
.left {
  padding-right: 10px;
}
.right {
  height: calc(50vh - 150px); //和左侧表格一样
  .inputBox {
    width: 40%;
  }
  .bottom {
    position: absolute;
    bottom: 15px;
  }
}
</style>
