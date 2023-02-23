//* 封装起来的校验函数，用在uploadWindData.vue组件中
export const checkUpload = (data, fieldData) => {
  checkEmptySelect(fieldData);
  const { datetimeExist, dateAndTimeExist } = checkDatetimeExist(fieldData);
  checkUniqueDatetime(fieldData);
  ({ data, fieldData } = handleDatetime(
    data,
    fieldData,
    datetimeExist,
    dateAndTimeExist
  ));
  checkEmptyHeight(fieldData);
  checkLeastWSAndWD(fieldData);
  checkDataType(data, fieldData);

  return { data, fieldData };
};

function checkEmptySelect(fieldData) {
  //检验是否有空的选择框
  for (let i = 0; i < fieldData.length; i++) {
    const element = fieldData[i];
    if (!element.typeOptions) {
      throw "空的选择框";
    }
  }
}

function handleDatetime(data, fieldData, datetimeExist, dateAndTimeExist) {
  // 日期时间的拼接处理
  if (datetimeExist) {
    //过滤掉multi列表里的d和t
    fieldData = fieldData.filter(
      (item) => item.typeOptions[1] !== "date" && item.typeOptions[1] !== "time"
    );
  } else if (dateAndTimeExist) {
    //把d和t拼成一个dt,再删掉d和t
    //修改字段表数据
    fieldData.push({
      index: data[0].length,
      typeOptions: ["datetime", "datetime"],
    });
    //找到时间日期所在的index,并合并加到dt字段
    const indexOfDate = fieldData.filter(
      (item) => item.typeOptions[1] === "date"
    )[0].index;
    const indexOfTime = fieldData.filter(
      (item) => item.typeOptions[1] === "time"
    )[0].index;
    data.forEach((line) => {
      const datetime = `${line[indexOfDate]} ${line[indexOfTime]}`;
      line.push(datetime);
    });
    //删除字段表的d,t信息
    fieldData = fieldData.filter(
      (item) => item.typeOptions[1] !== "date" && item.typeOptions[1] !== "time"
    );
  }
  return { data, fieldData };
}

function checkEmptyHeight(fieldData) {
  // 检验是否有空/非数字的高度行
  fieldData.forEach((element) => {
    if (element.typeOptions[0] === "v" || element.typeOptions[0] === "deg") {
      if (!element.height) throw "请输入高度";
      const heightStr = element.height.trim();
      const heightNotAllowed = heightStr === "" || isNaN(Number(heightStr));
      if (heightNotAllowed) throw "请输入正确的高度（不带单位的数字）";
    }
  });
}

function checkLeastWSAndWD(fieldData) {
  // 判断有没有至少一对风速风向数据
  const vAvgList = fieldData.filter(
    (item) => item.typeOptions[0] === "v" && item.typeOptions[1] === "avg"
  );
  const degAvgList = fieldData.filter(
    (item) => item.typeOptions[0] === "deg" && item.typeOptions[1] === "avg"
  );
  const vHeight = vAvgList.map((item) => item.height);
  const degHeight = degAvgList.map((item) => item.height);
  let isExist = false;
  for (let i = 0; i < vHeight.length; i++) {
    if (degHeight.indexOf(vHeight[i]) !== -1) isExist = true;
  }
  if (!isExist) throw "没有高度相同的成对风速风向";
}

function checkDatetimeExist(fieldData) {
  // 检查是否存在日期+时间/日期时间
  const fieldList = fieldData.map((item) => item.typeOptions[1]);
  const datetimeExist = fieldList.indexOf("datetime") !== -1;
  const dateExist = fieldList.indexOf("date") !== -1;
  const timeExist = fieldList.indexOf("time") !== -1;
  const dateAndTimeExist = dateExist && timeExist;
  const isExist = datetimeExist || dateAndTimeExist;
  if (!isExist) throw "缺少日期时间字段";
  return { datetimeExist, dateAndTimeExist };
}

function checkUniqueDatetime(fieldData) {
  // 检查日期时间是否唯一
  console.log(fieldData);
  //* 1.检查dt、d、t分别的个数，如果大于一个就是重复
  const datetimeList = fieldData.filter(
    (item) => item.typeOptions[0] === "datetime"
  );
  const dtList = datetimeList.filter(
    (item) => item.typeOptions[1] === "datetime"
  );
  const dList = datetimeList.filter((item) => item.typeOptions[1] === "date");
  const tList = datetimeList.filter((item) => item.typeOptions[1] === "time");
  if (dtList.length > 1 || dList.length > 1 || tList.length > 1)
    throw "多个日期时间字段存在冲突，请选择一个保留";

  //* 2.dt存在的情况下，检查有没有d或t
  if (dtList.length > 0 && (dList.length > 0 || tList.length > 0))
    throw "多个日期时间字段存在冲突，请选择一个保留";
}

function checkDataType(data, fieldData) {
  // 校验数据格式（有无空数据、非数字数据...）
  console.log(data);
  console.log(fieldData);
  for (let i = 0; i < fieldData.length; i++) {
    const field = fieldData[i];
    const fieldIndex = field.index;
    switch (field.typeOptions[0]) {
      case "v":
        //校验风速字段（大于0的数字）
        for (let j = 0; j < data.length; j++) {
          const dataItem = data[j];
          const str = dataItem[fieldIndex].trim();
          const typeNotAllowed = str === "" || isNaN(Number(str));
          if (typeNotAllowed)
            throw `第${j + 1}行风速数据"${dataItem[fieldIndex]}"格式错误！`;
          const rangeNotAllowed = Number(str) < 0;
          if (rangeNotAllowed)
            throw `第${j + 1}行风速数据"${dataItem[fieldIndex]}"范围错误！`;
        }
        break;
      case "deg":
        //校验风向角字段（0-360的数字）
        for (let j = 0; j < data.length; j++) {
          const dataItem = data[j];
          const str = dataItem[fieldIndex].trim();
          const typeNotAllowed = str === "" || isNaN(Number(str));
          if (typeNotAllowed)
            throw `第${j + 1}行风向角数据"${dataItem[fieldIndex]}"格式错误！`;
          const range = [0, 360];
          const rangeNotAllowed =
            Number(str) < range[0] || Number(str) > range[1];
          if (rangeNotAllowed)
            throw `第${j + 1}行风向角数据"${dataItem[fieldIndex]}"范围错误！`;
        }
        break;

      default:
        break;
    }
  }
}
