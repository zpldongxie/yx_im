import axios from 'axios'

import storage from './utils/localStorage'
import config from './configs'

const getToken = async uid => {
  const result = await axios({
    url: `${config.backgroundUrl}/xjxy/api/getIMToken`,
    method: 'post',
    headers: {
      'appkey': config.appkey,
      'content-type': 'application/json',
    },
    data: {
      'loginName': uid
    }
  });

  console.log(result);
  return result.data;

  // .then(res => {
  //   const data = res.data
  //   callback && callback(data);
  //   if (data.errCode === '0') {
  //     let sdktoken = data.data;
  //     // 服务端帐号均为小写
  //     // cookie.setCookie('uid', uid)
  //     // cookie.setCookie('sdktoken', sdktoken)
  //     storage.set('uid', uid);
  //     storage.set('sdktoken', sdktoken);
  //     location.href = config.homeUrl;
  //   } else {
  //     alert(data.message)
  //   }
  //   // this.$store.dispatch('hideLoading')
  // }).catch(err => {
  //   alert(err)
  //   // this.$store.dispatch('hideLoading')
  // })
};

/**
 * 获取用户信息，客户端专用
 *
 * @param {*} callback
 */
const getAppUserInfo = (callback) => {
  // 获取客户端信息
  var u = navigator.userAgent,
    app = navigator.appVersion;
  var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //android终端或者uc浏览器
  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  // 获取用户信息
  // ios
  function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement("iframe");
    WVJBIframe.style.display = "none";
    WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe);
    }, 0);
  }
  // android
  function getUserInfoForAndroid() {
    return JSON.parse(yspCheckIn.getUserInfo());
  }

  // 入口
  // const currentURL = new URL(location.href);
  // const currentId = currentURL.searchParams.get('loginName');
  // if (currentId) {
  //   callback(currentId, 'XjXmhSS20201202');
  // } else 
  if (isAndroid && yspCheckIn) {
    var userInfo = getUserInfoForAndroid();
    callback(userInfo.loginName, userInfo.password);
  } else if (isiOS) {
    setupWebViewJavascriptBridge(function (bridge) {
      //客户端已经注册好一个名为“getUserInfo”的方法，H5直接进行调用（方法名也为“getUserInfo”）就行，调用的时候可以传客户端需要的参数
      bridge && bridge.callHandler("getUserInfo", function responseCallback(responseData) {
        callback(responseData.account, responseData.password);
      });
    });
  }
}

/**
 * 初始化待办信息
 *
 */
const initToDoList = async (loginName, pwd, callback) => {
  const result = await axios.get(`${config.pcApiHost}/xjmh/yspapi/getxxList`, {params: {usercode: loginName, b: pwd}});
  if (result.status === 200) {
    const todoList = result.data;
    localStorage.removeItem('sysMsgs');
    localStorage.removeItem('customSysMsgs');
    localStorage.setItem('yspid', loginName);
    const oldMsgs = todoList.map(msg => ({
      apnsText: msg.BT, // "开具介绍信申请（教师）",
      avatar: "http://yx-web.nos.netease.com/webdoc/h5/im/default-icon.png",
      cc: false,
      content: JSON.stringify({"content": msg.CZNR}),
      from: "admin-tz",
      isPushable: true,
      isUnreadable: true,
      needPushNick: false,
      payload: {LCID: msg.LCID, XXID: msg.XXID, JSR: msg.JSR, LYXT: msg.LYXT, TASKTYPE: msg.TASKTYPE},
      scene: "p2p",
      sendToOnlineUsersOnly: true,
      showText: msg.CZNR, //"您的开具介绍信申请（教师）待提交;",
      status: "success",
      time: new Date().getTime(),
      to: loginName,
      type: "custom",
      unRead: true
    }))
    // localStorage.setItem('customSysMsgs', JSON.stringify(oldMsgs))
    callback(oldMsgs);
  }
};

const initLocalStorage = async (uid, callback) => {
  const result = await getToken(uid);
  console.log('result', result);
  if (result.errCode === '0') {
    const sdktoken = result.data;
    storage.set('uid', uid);
    storage.set('sdktoken', sdktoken);
    return callback(sdktoken);
  }
  return callback(0);
}

export default {
  getAppUserInfo,
  getToken,
  initLocalStorage,
  initToDoList
}