<template>
  <div class="g-inherit m-main p-general" v-if="myInfo.account">
    <group class="u-card">
      <cell :title="myInfo.nick" :inline-desc="'帐号: ' + myInfo.account">
        <img class="icon" slot="icon" width="20" :src="myInfo.avatar">
      </cell>
    </group>
    <group class="u-card">
      <cell title="昵称">{{myInfo.nick || ''}}</cell>
      <cell title="性别">{{myInfo.gender}}</cell>
      <cell title="生日">{{myInfo.birth}}</cell>
      <cell title="手机">{{myInfo.tel}}</cell>
      <cell title="邮箱">{{myInfo.email}}</cell>
      <cell title="签名">{{myInfo.sign}}</cell>
    </group>
    <div>
      <x-button type="warn" action-type="button" @click.native="logout">注销</x-button>
    </div>
  </div>
</template>

<script>
import { Group, Cell } from 'vux'
import config from '../configs'

export default {
  components: {
    Group,
    Cell
  },
  computed: {
    myInfo () {
      const info = {...this.$store.state.myInfo}
      const avatar = info.avatar 
                        ? info.avatar.includes('default-icon.png')
                          ? info.avatar
                          : config.managerUrl + info.avatar.replace('http://', '').split('?')[0] 
                        : ''
      info.avatar = avatar;
      return info
    }
  },
  methods: {
    logout () {
      let that = this
      this.$vux.confirm.show({
        title: '确定要注销帐号？',
        onConfirm () {
          that.$store.dispatch('logout')
        }
      })
    }
  }
}
</script>
