# wind-power-platform

注意：lat 为纬度(-90,90)，lng/lon 是经度(-180,180)

## 从命令行Git提交的方法
  1. 挂梯子
  2. 设置命令行代理：
  ```
  # git config --global http.proxy http://proxyUsername:proxyPassword@proxy.server.com:port
  # git config --global https.proxy http://proxyUsername:proxyPassword@proxy.server.com:port
  # git config --global 协议.proxy 协议://ip地址:端口号(就是clash.net的混合端口号)
  git config --global http.proxy http://127.0.0.1:xxxx
  git config --global https.proxy http://127.0.0.1:xxxx
  git config --global http.proxy 'socks5://127.0.0.1:xxxx'
  git config --global https.proxy 'socks5://127.0.0.1:xxxx'

  # 取消代理
  git config --global --unset http.proxy
  git config --global --unset https.proxy
   ```

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
