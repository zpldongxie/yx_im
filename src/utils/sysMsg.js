/*
 * @description: 消息工具类
 * @author: zpl
 * @Date: 2020-12-08 10:09:51
 * @LastEditTime: 2020-12-10 17:57:12
 * @LastEditors: zpl
 */

/**
 * 去重合并，数组1在上，数组2在下
 *
 * @param {*} arr1
 * @param {*} arr2
 * @returns
 */
export const mergeList = (arr1, arr2) => {
  try {
    arr1.forEach(msg => {
      if (typeof msg.idServer === 'undefined') {
        msg.idServer = msg.payload
          ? msg.payload.LCID
          : msg.pushPayload
            ? JSON.parse(msg.pushPayload).LCID
            : new Date().getTime()
      }
    });
    arr2.forEach(msg => {
      if (typeof msg.idServer === 'undefined') {
        msg.idServer = msg.payload
          ? msg.payload.LCID
          : msg.pushPayload
            ? JSON.parse(msg.pushPayload).LCID
            : new Date().getTime()
      }
    });
  } catch (error) {
    console.log(error);
  }
  const newList = arr1.concat(arr2);
  const returnList = [];
  newList.forEach(item => {
    const finded = returnList.find(t => t.idServer === item.idServer);
    if (finded && !finded.unRead) {
      item.unRead = false;
    } else {
      returnList.push(item);
    }
  });
  // TODO: 暂时过滤掉旧流程
  // const returnList = newList.filter(msg => {
  //   if (typeof msg.payload === 'undefined') {
  //     return true;
  //   }
  //   return msg.payload.LYXT !== 'PY'
  // });
  return returnList;
}