<template>
  <div class="g-inherit m-article">
    <x-header class="m-tab" :left-options="{backText: ' '}">
      <button-tab class="m-tab-top" v-model="sysType">
        <button-tab-item class="u-tab-top">待办工作<span v-if="!!customMsgUnread.length" class="red" ></span></button-tab-item>
        <button-tab-item class="u-tab-top">IM消息<span v-if="!!sysMsgUnread.length" class="red"></span></button-tab-item>
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
            @click.native="yjzdMsg(msg)"
          >
            <img v-if="sysType===0" class="icon" style="width: 2em; height: 1.4em;" slot="icon" :src="msg.unRead ? clIcon: yclIcon" />
            <img v-if="sysType===1" class="icon" slot="icon" width="24" :src="msg.avatar">
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

export default {
  // 进入该页面，文档被挂载
  mounted () {
    // this.$store.dispatch('markSysMsgRead')
    // this.$store.dispatch('markCustomSysMsgRead')
  },
  updated () {
    // this.$store.dispatch('markSysMsgRead')
    // this.$store.dispatch('markCustomSysMsgRead')
  },
  data () {
    return {
      sysType: 0, // 系统消息 1, 自定义消息 0,
      defaultAvatar: config.defaultUserIcon,
      clIcon: config.clIcon,
      yclIcon: config.yclIcon,
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
        const op = this.userInfos[msg.from]
        switch (msg.type) {
          case 'addFriend':
            msg.showText = `${op && op.nick ? op.nick + '(' + msg.friend.account + ')' : msg.friend.account} 添加您为好友~`
            msg.avatar = op && op.avatar || this.defaultAvatar
            return true
          case 'deleteFriend':
            msg.showText = `${op && op.nick ? op.nick + '('+ msg.from + ')' : msg.from} 将您从好友中删除`
            msg.avatar = op && op.avatar || this.defaultAvatar
            return true
          case 'applyTeam':
            msg.showText = msg.from
            msg.avatar = op && op.avatar || this.defaultAvatar
            msg.desc = `申请加入群:${this.getTeamName(msg.to)}`
            return true
          case 'teamInvite':
            msg.showText = msg.attach.team.name
            msg.avatar =  op && op.avatar || this.defaultAvatar
            msg.desc = `邀请你加入群${msg.to}`
            return true
          case 'rejectTeamApply':
            msg.showText = msg.attach.team.name
            msg.desc ='管理员拒绝你加入本群'
            msg.avatar = msg.attach.team && msg.attach.team.avatar || this.defaultAvatar
            return true
          case 'rejectTeamInvite':
            msg.showText = op.nick
            msg.avatar = op && op.avatar || this.defaultAvatar
            msg.desc = `${op.nick}拒绝了群${this.getTeamName(msg.to)}的入群邀请`
            return true
        }
        return false
      })
      sysMsgs.sort((msg1, msg2)=>{
        // 最新的排在前
        return msg2.time - msg1.time
      })
      return sysMsgs || []
    },
    customSysMsgs () {
      let customSysMsgs = this.$store.state.customSysMsgs.filter(msg => {
        if (msg.scene === 'p2p') {
          let content = JSON.parse(msg.content)
          msg.showText = `${content.content}`
          const fromUser = fromUser || {};
          // 附加信息
          const {pushPayload = '{}'} = msg
          msg.payload = msg.payload || JSON.parse(pushPayload)
          return msg
        }
        return false
      })
      return customSysMsgs || []
    },
    msgList() {
      if (this.sysType ===  1) {
        this.sysMsgs.forEach(msg => {
          msg.unRead = false;
        });
        this.$store.commit('updateSysMsgs', this.sysMsgs)
        this.postMessage(this.allUnread);
      }
      return this.sysType ===  1 ? this.sysMsgs : this.customSysMsgs
    },
    sysMsgUnread () {
      const list = this.sysMsgs.filter(msg => msg.unRead);
      return list
    },
    customMsgUnread () {
      const list = this.customSysMsgs.filter(msg => msg.unRead);
      return list
    },
    allUnread () {
      return this.sysMsgUnread.length + this.customMsgUnread.length;
    }
  },
  methods: {
    postMessage(num){
      const postData = {method: 'onSysMessage', payload: {length: num}};
      if (num) {
        postData.payload.length = num;
      } 
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(JSON.stringify(postData), '*')
      }
    },
    deleteMsg(idServer){
      if(this.sysType == 1){
        const list = this.sysMsgs; // JSON.parse(localStorage.getItem('sysMsgs') || []);
        const newList = list.filter((item) => item.idServer !== idServer);
        localStorage.setItem('sysMsgs', newList);
      }else{
        const list = this.customSysMsgs; JSON.parse(localStorage.getItem('customSysMsgs') || []);
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
    yjzdMsg (msg) {  // 一键直达
      console.log('into yjzdMsg');
      const {
        unRead,
        payload: {
          XXID,JSR,LCID,LYXT,TASKTYPE,XTURL
        }
      } = msg
      // if (!unRead) {
      //   return false;
      // }
      // msg.payload.XXID, msg.payload.JSR, msg.payload.LCID, msg.payload.LYXT, msg.payload.TASKTYPE
      // 更新已读状态
      const current = this.customSysMsgs.find(cmsg => cmsg.payload.XXID === XXID)
      current.unRead = false
      this.$store.commit('updateCustomSysMsgs', this.customSysMsgs)
      this.postMessage(this.allUnread);

      // 执行跳转
      let newUrl
      // TODO 1. 所有消息触发跳转时要发送信息给门户后台，同步已读状态
      //      2. 实现一个方法，分析要跳转的目标是否为移动端应用，以及是适配应用还是在线应用
      //      3. 可通过idp接口解决第二个问题，如果是适配应用，同时返回跳转所需的其他属性
      switch(LYXT){
        case 'XLC': // 新流程
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID
          break
        case 'GYJC': // 公寓检查
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station_gyjc.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID
          break
        case 'ZYGL': // 作业管理
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station_zygl.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID
          break
        case 'PXBGLSH': // 培训班
        case 'PXBGLSQ':
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station_pxb.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID + '&BJ=' + LYXT
          break
        case 'PXBGLBM': // 培训班报名
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/pxbgl/pxbbm/pxbbm_list.html'
          break
        case 'XSHDSH': // 线上大学生活动
        case 'XSHDSQ':
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/message_station_xsdxshd.html&XXID=' + XXID + '&JSR=' + JSR + '&LCID=' + LCID + '&BJ=' + LYXT
          break
        case 'XSHDBM': // 线上大学生活动报名
          newUrl = config.pcHost + '/fh-system/admin/casCheck?redirectUrl=/xsdxshd/hdbm/hdbm_list.html'
          break
        case 'CXCYDC': // 创新创业的督促消息，只是更改状态，不做跳转
          break
        case 'PY': // 普元
          newUrl = 'http://59.75.39.29/default/commom/login/messageurl.jsp?tyxtlb=xjmhMessages&wkItemID=' + LCID + '@' + TASKTYPE
          break
        case 'OA': // OA
          // TODO: 待与OA对接
          break;
        default: // 调查问卷等其他直接打开地址的应用
          newUrl = XTURL;
      }
      if (newUrl) {
        const postData = LYXT == 'PY' ? {
          method: 'openUrl',
          payload: {
            id: "80d74de8-373d-4bc3-98f4-b3e72eb25542",
            type: 2,
            address: newUrl,
            name: '待办工作',
            packageUrl: 'http://59.75.39.25/files/applications/5f1fdadb4bc860135ece13a6/5wjmbijs3a6.pma',
            logoUrl: '/files/appiconlogos/5f1fdadb4bc860135ece13a6/a8a0zfvf1s.png',
            description: '',
            isVisible: true,
            isMarketApplication: 0
          }
          // address: "http://59.75.39.29/default/commom/index/xijing_Entrance.jsp____ToDoWork"
        } : {
          method: 'openUrl',
          payload: {
            id: "baidu",
            type: 1,
            address: newUrl
          }
        };
        // if (LYXT === 'PY') {
        //   alert('旧系统消息请在PC端进行处理')
        //   return;
        // }

        if (window.parent && window.parent !== window) {
          window.parent.postMessage(JSON.stringify(postData), '*')
        } else {
          window.open(newUrl)
        }
      }
      // window.open("http://192.168.0.37:8080/fhcloud-client-pc/views/message_station.html?XXID=c078ca5b3d514433bffe2f2eebf57966&JSR=20060057&LCID=1227501")
    }
  }
}
</script>

<style type="text/css" lang=less>
  .m-tab {
    .m-tab-top {
      .u-tab-top {
        .red {
          display: inline-block;
          position: absolute;
          top: 0.3rem;
          padding: 2px;
          width: 0.2rem;
          height: 0.2rem;
          line-height: 0.5rem;
          /* font-size: 12px; */
          background-color: #f00;
          color: #fff;
          text-align: center;
          border-radius: 100%;
        }
      }
    }
  }
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