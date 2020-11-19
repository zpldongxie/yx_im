import axios from 'axios'

import storage from './utils/localStorage'
import config from './configs'

const getToken = async uid => {
  console.log('===========');
  console.log('config.backgroundUrl', config.backgroundUrl);
  console.log('===========');
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

const initLocalStorage = async (uid, callback) => {
  const result = await getToken(uid);
  console.log(result);
  if(result.errCode === '0'){
    const sdktoken = result.data;
    storage.set('uid', uid);
    storage.set('sdktoken', sdktoken);
    return callback(sdktoken);
  }
  return callback(0);
}

export default {
  getToken,
  initLocalStorage
}