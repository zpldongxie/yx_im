const rootUrl = '/h5';
let config = {
  // sdk: 'NIM_Web_SDK_v5.8.0',
  // sdk: 'NIM_Web_SDK_v6.1.0',
  sdk: 'NIM_Web_SDK_v7.8.1',
  // 用户自定义的登录注册地址
  loginUrl: `${rootUrl}/login.html`,
  registUrl: `${rootUrl}/regist.html`,
  homeUrl: `${rootUrl}/index.html#/session`,

  // 资源路径根目录，为了方便用户部署在二级以上URL路径上
  resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5',
  // 用户logo地址
  logo: 'http://yx-web.nos.netease.com/webdoc/h5/im/logo.png',
  // 默认用户头像
  defaultUserIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-icon.png',
  // 默认普通群头像
  defaultGroupIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-group.png',
  // 默认高级群头像
  defaultAdvancedIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-advanced.png',
  // 系统通知图标
  noticeIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/notice-icon.png',
  // 我的手机图标
  myPhoneIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/my-phone.png',
  // 通讯录图标
  contactsIcon: `${rootUrl}/img/im/contacts.png`,
  // 消息图标
  sessionIcon: `${rootUrl}/img/im/session.png`,
  // 加号图标
  addIcon: `${rootUrl}/img/im/add.png`,
  // 处理图标
  clIcon: `${rootUrl}/img/im/cl.png`,
  // 已处理图标
  yclIcon: `${rootUrl}/img/im/ycl.png`,
  // 本地消息显示数量，会影响性能
  localMsglimit: 36,
  useDb: false
}

const env = 'online'

let appConfig = {
  // 用户的appkey
  // 用于在web demo中注册账号异步请求demo 服务器中使用
  test: {
    appkey: 'fe416640c8e8a72734219e1847ad2547',
    postUrl: 'https://apptest.netease.im',
    backgroundUrl: 'http;//59.75.39.25:30081', // 本地后台服务
    managerUrl: 'http://59.75.39.25',  // manager地址，读取用户头像等表态资源时需要使用
    pcHost: 'http://59.75.39.29:8001'
  },
  online: {
    appkey: 'a5cd5da7be8831d093e2e56ac22c87e5',
    postUrl: 'https://app.netease.im',
    backgroundUrl: 'http://59.75.39.25:30081', // 本地后台服务
    managerUrl: 'http://59.75.39.25',  // manager地址，读取用户头像等表态资源时需要使用
    pcHost: 'http://59.75.39.29:8001'
  }
}

config = Object.assign(config, appConfig[env])

export default config
