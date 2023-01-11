let wsBaseURL = "ws://1.117.224.40/ws";
let pingTimer = null;
//发起ws的主函数
export function connectWS(subURL, callback) {
  const url = [wsBaseURL, subURL].join("");
  let ws = initWS(url, callback);
  wsPing(ws, 25);
  return ws;
}

// 初始化ws
function initWS(url, _callback) {
  if (typeof WebSocket === "undefined") {
    alert("您的浏览器不支持WebSocket，无法获取数据");
    return false;
  }
  console.log(url);
  let websocket = new WebSocket(url);
  websocket.onmessage = function (e) {
    wsOnMessage(e, _callback);
  };
  websocket.onopen = function () {
    console.log("ws连接成功");
  };
  websocket.onerror = function () {
    alert("ws连接出错");
  };
  websocket.onclose = function () {
    console.log("ws连接断开");
  };
  return websocket;
}

// 监听到消息的函数
function wsOnMessage(e, _callback) {
  try {
    var data = JSON.parse(e.data);
  } catch (error) {
    var data = e.data;
  }
  _callback(data);
}

// 定时发送心跳维持连接
function wsPing(_ws, interval) {
  pingTimer = setInterval(() => {
    if (_ws.readyState === _ws.OPEN) {
      // 连接已建立
      _ws.send("ping");
      // console.log("ping过去了");
    } else if (_ws.readyState === _ws.CLOSED) {
      clearInterval(pingTimer);
    }
  }, 1000 * interval);
}
