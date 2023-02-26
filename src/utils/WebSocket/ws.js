import { rootWSURL } from "/rootURL";

//发起ws的主函数
export function connectWS(subURL, callback) {
  const url = [rootWSURL, subURL].join("");

  const ws = initWS(url, callback);
  return ws;
}
export function connectLocalWS(url, callback) {
  const ws = initWS(url, callback);
  return ws;
}
// 初始化ws
function initWS(url, _callback) {
  if (typeof WebSocket === "undefined") {
    alert("您的浏览器不支持WebSocket，无法获取数据");
    return false;
  }
  let pingTimer = null;
  const websocket = new WebSocket(url);
  websocket.onmessage = function (e) {
    wsOnMessage(e, _callback);
  };
  websocket.onopen = function () {
    console.log("ws连接成功");
    pingTimer = wsPing(websocket, 25);
  };
  websocket.onerror = function (e) {
    console.log(e);
    console.log("ws连接出错");
  };
  websocket.onclose = function (e) {
    wsOnClose(e, websocket, pingTimer, url, _callback);
  };
  return websocket;
}

// 监听到消息的函数
function wsOnMessage(e, _callback) {
  let data;
  try {
    data = JSON.parse(e.data);
  } catch (error) {
    data = e.data;
  }
  _callback(data);
}
function wsOnClose(e, _ws, _pingTimer, url, _callback) {
  // 令人心碎的耦合，但是水平有限只好将就这么写了
  console.log("ws连接断开");
  console.log(e);
  if (_pingTimer) {
    clearInterval(_pingTimer);
    _pingTimer = null;
  }
  if (e.code !== 1005) {
    //1005是浏览器调用ws.close()导致的关闭，如果不是就需要重连
    if (_ws) {
      _ws.close();
      //! 这里有问题，传递的_ws是值传递不是引用传递，函数外部的ws没有销毁，但是不知道为什么不影响功能实现
      _ws = null;
    }
    initWS(url, _callback);
    console.log("ws重连");
  }
}
// 定时发送心跳维持连接
function wsPing(_ws, interval) {
  let pingTimer = setInterval(() => {
    if (_ws.readyState === _ws.OPEN) {
      // 如果连接已建立
      _ws.send("ping");
      console.log("ping");
    } else if (_ws.readyState === _ws.CLOSED || !_ws) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  }, 1000 * interval);
  return pingTimer;
}
