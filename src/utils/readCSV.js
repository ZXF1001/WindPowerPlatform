const Papa = require("papaparse");
export function readLocalCSV(selectedFile, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(selectedFile);
  reader.onload = (evt) => {
    // 检查编码
    const encoding = checkEncoding(evt.target.result);
    // 将csv转换成二维数组
    Papa.parse(selectedFile, {
      encoding: encoding,
      complete: callback,
    });
  };
}

function checkEncoding(base64Str) {
  // 返回编码方式
  const str = atob(base64Str.split(";base64,")[1]);
  const jschardet = require("jschardet");
  let encoding = jschardet.detect(str);
  encoding = encoding.encoding;
  // console.log( encoding );
  if (encoding === "windows-1252") {
    // 有时会识别错误（如UTF8的中文二字）
    encoding = "ANSI";
  }
  return encoding;
}

export function readRemoteCSV(url, callback) {
  Papa.parse(url, {
    download: true,
    complete: callback,
  });
}
