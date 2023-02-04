# Wind Power Platform

  智慧风电场优化云计算平台的前端源码，采用Vue2构建

## 注意
  1. lat 为纬度(-90,90)，lng/lon 是经度(-180,180)

## 项目npm操作
  1. 项目依赖安装
  ```
  npm install
  ```
  ***注意：***
  ***leaflet-geotiff-plotty.js的64行开头缺一个let:***

  `(let )dataUrl = plot.colorScaleCanvas.toDataURL();`
  
  ***需要修改，否则绘制colorbar会报错***

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
  - [x] 总览页折线图出问题
  - [x] 绘制云图的colorbar
  - [x] （地图）加载geotiff时提示进度
  - [ ] ~~筛选重绘时玫瑰图的legend全部显示~~
  - [x] （地图）流线图的json从云端读取
  - [x] 日期格式化封装成函数
  - [x] 上传完成后刷新页面
  - [x] api端口改用3000
  - [x] 缺少最大速度/最小速度数据时，速度时间图怎么处理
  - [ ] ~~天气页面的经纬度位置（由于改为在后端获取数据，不方便在前端直接获取经纬度）~~

  - [x] 上传完成后提示“已将xxx条数据上传至数据库”
  - [x] 异步forEach替换为同步的for
  - [x] 总览页数据错乱，服务器崩溃
  - [x] （上传）屏幕不能大片空白
  - [ ] ~~（上传）上传时间太长加入取消功能（暂时不需要这么复杂）~~
  - [ ] （全局）折叠边栏无法触发onresize事件
  - [ ] （地图）地图显示范围自动设置为风电场位置范围
  - [ ] （地图）点击某位置显示contour的值
  - [ ] （地图）根据数据生成geotiff
  - [x] （地图）不显示云图时，隐藏colorbar
  - [ ] （上传）! 光修改字段设置表的输入框不会改变实际的上传值
  - [ ] （风速）风速-时间曲线自定义日期范围时，如果数据量太大要提示
  - [ ] （上传）缺少平均速度要报错
  - [ ] （风速）数据视图的标题
  - [ ] 导入风资源文件的单位
  
## 下阶段开发计划
  - [ ] 地形可视化模块
    - three.js
    - geotiff高程文件的读取
    - 后端画网格功能
  - [x] websocket配置
  - [ ] ~~拓展上传的格式（如xlsx）~~
  - [ ] 云端python程序的控制
  - [ ] 模块化：把首页地图组件和风资源云图的地图组件共用部分封装成模块
  - [ ] svg自动生成颜色

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