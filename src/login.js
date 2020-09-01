import Vue from 'vue'

// 添加Fastclick移除移动端点击延迟
import FastClick from 'fastclick'
FastClick.attach(document.body)

// 添加手势触摸事件，使用方法如 v-touch:swipeleft
import VueTouch from './plugins/touchEvent'
Vue.use(VueTouch)

// import md5 from './utils/md5'
// import cookie from './utils/cookie'
import config from './configs'

import { initLocalStorage } from './api'

var formData = new Vue({
  el: '#form-data',
  data: {
    logo: config.logo,
    account: '',
    password: '',
    errorMsg: ''
  },
  mounted() {
    this.$el.style.display = ""
  },
  methods: {
    login() {
      if (this.account === '') {
        this.errorMsg = '帐号不能为空'
        return
      } else if (this.password === '') {
        this.errorMsg = '密码不能为空'
        return
      } else if (this.password.length < 6) {
        this.errorMsg = '密码至少需要6位'
        return
      }
      this.errorMsg = ''
      console.log(this.account.toLowerCase());
      initLocalStorage(this.account.toLowerCase(), result => {
        if (result)
          location.href = config.homeUrl;
      });
    },
    regist() {
      location.href = config.registUrl
    }
  },
})