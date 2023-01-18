# Wind Power Platform

  智慧风电场优化云计算平台的前端源码，采用Vue2构建

## 注意
  1. lat 为纬度(-90,90)，lng/lon 是经度(-180,180)

## 项目npm操作
  1. 项目依赖安装
  ```
  npm install
  ```

  2. 项目运行
  ```
  npm run serve
  ```

  3. 项目编译
  ```
  npm run build
  ```
## 现存issues
  - [x] 和风天气api应放在后端请求
  - [x] 总览页超出高度
  - [ ] 总览页折线图出问题
  - [ ] 绘制云图的colorbar
  - [ ] 根据数据生成geotiff
  - [ ] 地图显示范围自动设置为风电场位置范围
  - [ ] ~~筛选重绘时玫瑰图的legend全部显示~~
  - [x] 流线图的json从云端读取
  - [x] 日期格式化封装成函数
  - [ ] 上传时间太长加入取消功能
  - [ ] ! 光修改字段设置表的输入框不会改变实际的上传值
  - [ ] 上传完成后刷新页面
  - [x] api端口改用3000
  - [ ] ~~静态资源（geotiff等）用Express代理~~
  - [ ] 风速-时间曲线自定义日期范围时，如果数据量太大要提示
  - [x] 缺少最大速度/最小速度数据时，速度时间图怎么处理
  - [ ] 天气页面的经纬度位置
  - [ ] ~~导入风资源文件的单位~~
  - [x] 上传完成后提示“已将xxx条数据上传至数据库”
  - [x] 异步forEach替换为同步的for
  - [x] 总览页数据错乱，服务器崩溃

## 下阶段开发计划
  - [ ] 地形可视化模块
    - three.js
    - 后端画网格功能
  - [x] websocket配置
  - [ ] ~~拓展上传的格式（如xlsx）~~
  - [ ] 云端python程序的控制

## 功能备忘录
  - [ ] （地形）选取建模范围，根据范围内和周边地形生成网格
  - [ ] （地形）投影系的转化
  - [ ] 先开发单独风电场，再开发全国任意
  - [ ] （地形）地形图数据源（DEM有SRTM30m、90m、NASADEM30m；粗糙度有NLCD、CLC和ESA300m、ESA WorldCover 2020 10m、LC 2019 100m）也可自己导入
  - [ ] （地形）多个集群分别加密
  - [ ] （风机）批量导入风机，自定义颜色
  - [ ] （地形）粗糙度信息在模板的基础上修改
  - [ ] （风资源）风廓线
  - [ ] （仿真）分扇区进行计算