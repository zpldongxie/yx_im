/*
 * @description: 消息工具类
 * @author: zpl
 * @Date: 2020-12-08 10:09:51
 * @LastEditTime: 2020-12-08 20:08:08
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
  const newArr2 = arr2.filter((item) => {
    const finded = arr1.find((item1) => {
      const idServerSame = (typeof item.idServer !== 'undefined' && typeof item1.idServer !== 'undefined') ? item.idServer === item1.idServer : false
      const xxidSame = (item1.payload && item.payload) ? item1.payload.XXID === item.payload.XXID : false;
      return idServerSame || xxidSame
    });
    if (finded && !finded.unRead) {
      item.unRead = false;
    }
    return !finded;
  });
  const newList = arr1.concat(newArr2);
  newList.forEach(msg => {
    if (typeof msg.idServer === 'undefined') {
      msg.idServer = msg.payload && msg.payload.XXID || new Date().getTime()
    }
  });
  // TODO: 暂时过滤掉旧流程
  // const returnList = newList.filter(msg => {
  //   if (typeof msg.payload === 'undefined') {
  //     return true;
  //   }
  //   return msg.payload.LYXT !== 'PY'
  // });
  return newList;
}