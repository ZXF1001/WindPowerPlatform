export default function dateFormatter(datetime, type) {
  // 输入Datetime格式，输出格式化的字符串
  const YY = datetime.getFullYear();
  const MM = datetime.getMonth() + 1;
  const DD = datetime.getDate();
  const hh = datetime.getHours();
  const mm = datetime.getMinutes();
  const ss = datetime.getSeconds();
  switch (type) {
    case "typical":
      return `${YY}-${MM}-${DD} ${hh < 10 ? "0" + hh : hh}:${
        mm < 10 ? "0" + mm : mm
      }:${ss < 10 ? "0" + ss : ss}`;
    case "Chinese":
      return `${YY}年${MM}月${DD}日 ${hh < 10 ? "0" + hh : hh}:${
        mm < 10 ? "0" + mm : mm
      }:${ss < 10 ? "0" + ss : ss}`;
    default:
      return;
  }
}
