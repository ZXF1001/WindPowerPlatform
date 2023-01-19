const Papa = require("papaparse");
module.exports = function readLocalCSV(selectedFile, callback) {
  var reader = new FileReader();
  reader.readAsDataURL(selectedFile);
  reader.onload = (evt) => {
    // 检查编码
    let encoding = checkEncoding(evt.target.result);
    // 将csv转换成二维数组
    Papa.parse(selectedFile, {
      encoding: encoding,
      complete: callback,
    });
  };
};

function checkEncoding(base64Str) {
  // 返回编码方式
  var str = atob(base64Str.split(";base64,")[1]);
  const jschardet = require("jschardet");
  var encoding = jschardet.detect(str);
  encoding = encoding.encoding;
  // console.log( encoding );
  if (encoding === "windows-1252") {
    // 有时会识别错误（如UTF8的中文二字）
    encoding = "ANSI";
  }
  return encoding;
}
module.exports = function readRemoteCSV(url, callback) {
  Papa.parse(url, {
    download: true,
    complete: callback,
  });
};
