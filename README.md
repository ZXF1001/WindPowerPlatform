# Wind Power Platform

  智慧风电场优化云计算平台的前端源码，采用Vue2构建

## 注意
  1. lat 为纬度(-90,90)，lng/lon 是经度(-180,180)

## 从命令行Git提交的方法
  1. 挂梯子
  2. 设置命令行代理：
  ```
  #端口号11223是梯子的端口号
  git config --global http.proxy http://127.0.0.1:11223
  git config --global https.proxy http://127.0.0.1:11223

  #下两行可选，我也不知道是什么
  git config --global http.proxy 'socks5://127.0.0.1:11223'
  git config --global https.proxy 'socks5://127.0.0.1:11223'

  # 取消代理
  git config --global --unset http.proxy
  git config --global --unset https.proxy
   ```

## npm操作
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
  - [ ] 和风天气api应放在后端请求
  - [ ] 绘制云图的colorbar
  - [ ] 根据数据生成geotiff
  - [ ] 地图显示范围自动设置为风电场位置范围
  - [ ] 筛选重绘时玫瑰图的legend全部显示
  - [ ] websocket取代轮询
  - [x] 日期格式化封装成函数

## 下阶段开发进程
  - [ ] 地形可视化模块
    - three.js学习
  - [ ] websocket配置
  - [ ] ...