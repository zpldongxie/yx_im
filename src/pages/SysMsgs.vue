<template>
  <div class="g-inherit m-article">
    <x-header class="m-tab" :left-options="{backText: ' '}">
      <button-tab class="m-tab-top" v-model="sysType">
        <button-tab-item class="u-tab-top">待办工作</button-tab-item>
        <button-tab-item class="u-tab-top">IM消息</button-tab-item>
      </button-tab>
      <a slot="left"></a>
      <a slot="right" @click.stop="clearMsgs">清空</a>
    </x-header>
    <div class="m-article-main p-sysmsgs">
      <group class="u-list">
        <template v-for="msg in msgList">
          <cell 
            v-if='msg.type ==="applyTeam" || msg.type ==="teamInvite"'
            class="u-list-item"
            :key="msg.idServer"
            :idServer ="msg.idServer"
            v-touch:swipeleft="showDelBtn"
            v-touch:swiperight="hideDelBtn"
          > 
            <img class="icon" slot="icon" width="24" :src="msg.avatar">
            <div slot="child"  class='g-teamSys'>
              <div class='m-info'>
                <span class='u-name'>{{msg.from}}</span>
                <span class='u-time'>{{msg.showTime}}</span>
                <p class='u-desc'>{{msg.desc}}</p>
                <p v-if='msg.ps' class='u-desc'>{{`留言:${msg.ps}`}}</p>
              </div>
              <div class='m-options' slot='default' v-if='deleteIdServer !== msg.idServer'>
                <template v-if='msg.state === "init"'>
                  <x-button type="primary" :mini='true' action-type="button" @click.native="handleTeamApply(msg, true)">同意</x-button>
                  <x-button type="warn" :mini='true' action-type="button" @click.native="handleTeamApply(msg, false)">拒绝</x-button>
                </template>
                <div v-else class='u-msg-state'>
                  {{msg.state==='error'? '已过期' : msg.state==='rejected'?'已拒绝':'已同意'}}
                </div>
              </div>
            </div>
            <span class="u-tag-del" :class="{active: deleteIdServer === msg.idServer}" @click="deleteMsg(msg.idServer)"></span>
          </cell>
          <cell
            v-else
            class="u-list-item"
            :title="msg.showText"
            :value="msg.showTime"
            :inline-desc="msg.desc"
            :key="msg.idServer"
            :idServer ="msg.idServer"
            v-touch:swipeleft="showDelBtn"
            v-touch:swiperight="hideDelBtn"
          >
            <img class="icon" slot="icon" width="24" :src="msg.avatar" @click="yjzdMsg(msg.payload.XXID, msg.payload.JSR, msg.payload.LCID, msg.payload.LYXT, msg.payload.TASKTYPE)">
            <!-- <span>{{msg.pushPayload}}</span> -->
            <span class="u-tag-del" :class="{active: deleteIdServer === msg.idServer}" @click="deleteMsg(msg.idServer)"></span>
          </cell>
        </template>
      </group>
       <div class='empty-hint' v-if='!msgList || msgList.length<1'>暂无任何消息</div>
    </div>
  </div>
</template>

<script>
import config from '../configs'

/**
 * 去重合并
 */
const mergeList = (arr1, arr2) => {
  const newArr2 = arr2.filter((item) => !arr1.find((item1) => item1.idServer === item.idServer));
  return arr1.concat(newArr2);
}
export default {
  // 进入该页面，文档被挂载
  mounted () {
    this.$store.dispatch('markSysMsgRead')
    this.$store.dispatch('markCustomSysMsgRead')
  },
  updated () {
    this.$store.dispatch('markSysMsgRead')
    this.$store.dispatch('markCustomSysMsgRead')
  },
  data () {
    return {
      sysType: 0, // 系统消息 1, 自定义消息 0,
      defaultAvatar: config.defaultUserIcon,
      deleteIdServer: ''
    }
  },
  computed: {
    userInfos () {
      return this.$store.state.userInfos || {}
    },
    sysMsgs () {
       // 同步本地存储
      let yspid = localStorage.getItem('yspid');
      let uid = localStorage.getItem('uid');
      if (!yspid || yspid !== uid) {
        localStorage.removeItem('sysMsgs');
        localStorage.setItem('yspid', uid);
      }
      // 获取新消息
      let sysMsgs = this.$store.state.sysMsgs.filter(msg => {
        switch (msg.type) {
          case 'addFriend':
            msg.showText = `${msg.friend.alias || msg.friend.account} 添加您为好友~`
            const addAvatar = this.userInfos[msg.from] && this.userInfos[msg.from].avatar ? this.userInfos[msg.from].avatar : ''
            const currentAddAvatar = addAvatar 
                          ? addAvatar.includes('default-icon.png')
                            ? addAvatar
                              : config.managerUrl + addAvatar.replace('http://', '').split('?')[0] 
                          : ''
            msg.avatar = currentAddAvatar
            return true
          case 'deleteFriend':
            msg.showText = `${msg.from} 将您从好友中删除`
            const showAvatar = this.userInfos[msg.from].avatar || ''
            const currentShowAvatar = showAvatar 
                          ? showAvatar.includes('default-icon.png')
                            ? showAvatar
                              : config.managerUrl + showAvatar.replace('http://', '').split('?')[0] 
                          : ''
            msg.avatar = currentShowAvatar 
            return false
          case 'applyTeam':
            msg.showText = msg.from
            const applyAvatar = this.userInfos[msg.from] && this.userInfos[msg.from].avatar ? config.managerUrl + this.userInfos[msg.from].avatar.replace('http://', '').split('?')[0] : ''
            msg.avatar = applyAvatar || this.defaultAvatar
            msg.desc = `申请加入群:${this.getTeamName(msg.to)}`
            return true
          case 'teamInvite':
            msg.showText = msg.attach.team.name
            const teamavatar = this.userInfos[msg.from] && this.userInfos[msg.from].avatar ? config.managerUrl + this.userInfos[msg.from].avatar.replace('http://', '').split('?')[0] : ''
            msg.avatar =  teamavatar || this.defaultAvatar
            msg.desc = `邀请你加入群${msg.to}`
            return true
          case 'rejectTeamApply':
            msg.showText = msg.attach.team.name
            msg.desc ='管理员拒绝你加入本群'
            const rejectavatar = msg.attach.team.avatar ? config.managerUrl + msg.attach.team.avatar.replace('http://', '').split('?')[0] : ''
            msg.avatar = rejectavatar || this.defaultAvatar
            return true
          case 'rejectTeamInvite':
            let op = this.userInfos[msg.from]
            msg.showText = op.nick
            const inviteavatar = op.avatar ? config.managerUrl + op.avatar.replace('http://', '').split('?')[0] : ''
            msg.avatar = inviteavatar || this.defaultAvatar
            msg.desc = `${op.nick}拒绝了群${this.getTeamName(msg.to)}的入群邀请`
            return true
        }
        return false
      })
      sysMsgs.sort((msg1, msg2)=>{
        // 最新的排在前
        return msg2.time - msg1.time
      })
      const storage = localStorage.getItem("sysMsgs");
      let newStorage = storage ? JSON.parse(storage) : [];
      if (sysMsgs.length>0) {
        // newStorage = newStorage.concat(sysMsgs);
        newStorage = mergeList(sysMsgs, newStorage);
        console.log('newStorage',newStorage);
        localStorage.setItem("sysMsgs",JSON.stringify(newStorage))
      }
      // let localSysMsgs =JSON.parse(localStorage.getItem("sysMsgs")) 
      return newStorage || []
    },
    customSysMsgs () {
       // 同步本地存储
      let yspid = localStorage.getItem('yspid');
      let uid = localStorage.getItem('uid');
      if (!yspid || yspid !== uid) {
        localStorage.removeItem('customSysMsgs');
        localStorage.setItem('yspid', uid);
      }

      let customSysMsgs = this.$store.state.customSysMsgs.filter(msg => {
        if (msg.scene === 'p2p') {
          let content = JSON.parse(msg.content)
          msg.showText = `${content.content}`
          const fromUser = fromUser || {};
          // 头像
          const avatar = fromUser.avatar 
                          ? config.managerUrl + fromUser.avatar.replace('http://', '').replace('default-icon.png', 'notice-icon.png').split('?')[0]
                          : this.defaultAvatar
          msg.avatar = avatar
          // 附加信息
          const {pushPayload = '{}'} = msg
          msg.payload = JSON.parse(pushPayload)
          return msg
        }
        return false
      })
      const custom = localStorage.getItem("customSysMsgs");
      let newCustomSysMsgs = custom ? JSON.parse(custom) : [];
      if (customSysMsgs.length>0) {
        // newCustomSysMsgs = newCustomSysMsgs.concat(customSysMsgs);
        newCustomSysMsgs = mergeList(customSysMsgs, newCustomSysMsgs);
        localStorage.setItem("customSysMsgs",JSON.stringify(newCustomSysMsgs))
      }
      // let localCustomSysMsgs =JSON.parse(localStorage.getItem("customSysMsgs")); 
      return newCustomSysMsgs || []
    },
    msgList() {
      return this.sysType ===  1 ? this.sysMsgs : this.customSysMsgs
    }
    
  },
  methods: {
    deleteMsg(idServer){
      var that = this
      if(that.sysType == 1){
        // const list = localStorage.removeItem('sysMsgs');
        const list = JSON.parse(localStorage.getItem('sysMsgs') || []);
        const newList = list.filter((item) => item.idServer !== idServer);
        localStorage.setItem('sysMsgs', newList);
      }else{
        // localStorage.removeItem('customSysMsgs');
        const list = JSON.parse(localStorage.getItem('customSysMsgs') || []);
        const newList = list.filter((item) => item.idServer !== idServer);
        localStorage.setItem('customSysMsgs', newList);
      }
      this.$store.commit('deleteSysMsgs', {
        type: this.sysType,
        idServer: idServer,
      })
    },
    clearMsgs () {
      var that = this
      this.$vux.confirm.show({
        title: '确认要清空消息吗？',
        onConfirm () {
          console.log('that.sysType', that.sysType);
          if(that.sysType == 1){
            localStorage.removeItem('sysMsgs');
          }else{
            localStorage.removeItem('customSysMsgs');
          }
          that.$store.dispatch('resetSysMsgs', {
            type: that.sysType
          })
        }
      })
    },
    getTeamName(teamId) {
      let team = this.$store.state.teamlist.find(team => {
        return team.teamId === teamId
      })
      return team && team.name || ''
    },
    handleTeamApply(msg, pass) {
      let action
      switch (msg.type) {
        case 'applyTeam':
          action = pass ? 'passTeamApply' : 'rejectTeamApply'
          break;
         case 'teamInvite':
          action = pass ? 'acceptTeamInvite' : 'rejectTeamInvite'
          break;
        default:
          return
      }
      this.$store.dispatch('delegateTeamFunction', {
        functionName: action, 
        options: {
          idServer: msg.idServer,
          teamId: msg.to,
          from: msg.from,
          done: (error, obj)=>{
            console.log('handleDone', obj)
          }
        }
      })
    },
    findTeamInfo(teamId) {
      var team = this.$store.state.teamlist.find(item =>{
        return item.teamId === teamId
      })
      return team && team.name || teamId
    },
    showDelBtn (vNode) {
      if (vNode && vNode.data && vNode.data.attrs) {
        this.deleteIdServer = vNode.data.attrs.idServer
        this.stopBubble = true
        setTimeout(() => {
          this.stopBubble = false
        }, 20)
      }
    },
    hideDelBtn () {
      if (this.deleteIdServer !== null && !this.stopBubble) {
        // 用于判断是否前置状态是显示删除按钮
        this.deleteIdServer = null
        return true
      }
      return false
    },
    yjzdMsg (XXID, JSR, LCID, LYXT, TASKTYPE) {  // 一键直达
      let newUrl;
      if(LYXT == 'XLC'){ // 新流程
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID
      }else if(LYXT == 'GYJC'){ // 公寓检查
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station_gyjc.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID
      }else if(LYXT == 'ZYGL'){ // 作业管理
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station_zygl.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID
      }else if(LYXT == 'PY'){ // 普元
          let xxcs = {xxid:XXID}
          commonAPI.setXxztAPI(xxcs).then(res => { // 设置整体消息状态
              console.log(res)
          })
          newUrl = 'http://' + process.env.VUE_APP_PUYUAN_URL + '/default/commom/login/messageurl.jsp?tyxtlb=xjmhMessages&wkItemID=' + LCID + '@' + TASKTYPE
      }
      // newUrl && window.open(newUrl);
      newUrl && (window.location.href = newUrl);
      let _this = this
      setTimeout(function (){
          _this.getXxList()
      },1000)
      // window.open("http://192.168.0.37:8080/fhcloud-client-pc/views/message_station.html?XXID=c078ca5b3d514433bffe2f2eebf57966&JSR=20060057&LCID=1227501")
    }
  }
}
</script>

<style type="text/css" lang=less>
  .p-sysmsgs {
    padding-top: 58px;
    .u-list {
      height: 100%;
      overflow-y: scroll;
    }
    p {
      word-wrap: normal;
      word-break: break-all;
      color: #333;
    }
    
    .g-teamSys {
      display: flex;
      flex-grow: 100;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      
      .m-info {
        flex-shrink: 1;
        overflow: hidden;

        .u-time {
          color: #aaa;
        }
        .u-desc {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #aaa;
          font-size: 1rem;
        }
      }

      .m-options{
        display: flex;
        align-items: center;
        
        .weui-btn.weui-btn_mini {
          padding: 0;
          width: 3rem;
          height: 2rem;
        }
        
        .weui-btn + .weui-btn {
          margin-top: 0;
          margin-left: 0.5rem;
        }
      }
    }
    .u-msg-state {
      color: #aaa;
      font-size: .9rem;
    }
    .empty-hint{
      position: absolute;
      left: 0;
      right: 0;
      top: 10rem;  
      margin: auto;
      text-align: center;
    }
  }
</style>