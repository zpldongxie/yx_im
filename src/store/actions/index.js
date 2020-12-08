// Action 提交的是 mutation，而不是直接变更状态。
// Action 可以包含任意异步操作。
// import cookie from '../../utils/cookie'
import storage from '../../utils/localStorage'
import { getAppUserInfo, initLocalStorage, initToDoList } from '../../api'
import pageUtil from '../../utils/page'

/* 导出actions方法 */
import {showLoading, hideLoading, showFullscreenImg, hideFullscreenImg} from './widgetUi'
import {initNimSDK} from './initNimSDK'
import {initChatroomSDK, resetChatroomSDK} from './initChatroomSDK'
import {updateBlack} from './blacks'
import {updateFriend, addFriend, deleteFriend} from './friends'
import {resetSearchResult, searchUsers, searchTeam} from './search'
import {deleteSession, setCurrSession, resetCurrSession} from './session'
import {sendMsg, sendFileMsg, sendMsgReceipt, sendRobotMsg, revocateMsg, updateLocalMsg, getHistoryMsgs, resetNoMoreHistoryMsgs, continueRobotMsg} from './msgs'
import {markSysMsgRead, resetSysMsgs, deleteSysMsgs, markCustomSysMsgRead, onCustomSysMsgs} from './sysMsgs'
import {sendChatroomMsg, sendChatroomRobotMsg, sendChatroomFileMsg, getChatroomHistoryMsgs} from './chatroomMsgs'
import {initChatroomInfos, getChatroomInfo, getChatroomMembers, clearChatroomMembers} from './chatroomInfos'
import { delegateTeamFunction, onTeamNotificationMsg, enterSettingPage, getTeamMembers, checkTeamMsgReceipt, getTeamMsgReads} from './team'

function connectNim ({state, commit, dispatch}, obj) {
  let {force} = Object.assign({}, obj)
  // 操作为内容页刷新页面，此时无nim实例
  if (!state.nim || force) {
    let loginInfo = {
      uid: storage.get('uid'),
      sdktoken: storage.get('sdktoken'),
    }
    getAppUserInfo((loginName, pwd) => {
      console.log('loginName: ', loginName);
      if (!loginInfo.uid || loginInfo.uid !== loginName) {
        initToDoList(loginName, pwd, onCustomSysMsgs);
      } else {
        const customMsgStr = localStorage.getItem('customSysMsgs') || '[]'
        const sysMsgStr = localStorage.getItem('sysMsgs') || '[]'
        const customMsgList = JSON.parse(customMsgStr)
        const sysMsgList = JSON.parse(sysMsgStr)
        commit('updateCustomSysMsgs', customMsgList)
        commit('updateCustomSysMsgUnread', {
          type: 'reset',
          unread: customMsgList.filter(msg => msg.unRead).length
        })
        commit('updateSysMsgs', sysMsgList)
        commit('updateSysMsgUnread', {
          total: sysMsgList.length,
          addFriend: sysMsgList.filter(msg => (msg.unRead && msg.type === 'addFriend')).length,
          deleteFriend: sysMsgList.filter(msg => (msg.unRead && msg.type === 'deleteFriend')).length,
          team: sysMsgList.filter(msg => (msg.unRead && msg.type === 'team')).length
        })
      }
      initLocalStorage(loginName, result => {
        dispatch('hideLoading')
        if(result) {
          dispatch('initNimSDK', {
            uid: loginName,
            sdktoken: storage.get('sdktoken'),
          })
        } else {
          // pageUtil.turnPage('请重新登录', 'login')
          window.parent.postMessage('backtoHomepage', '*')
        }
      })
    });
    // if (currentId) { // 参数里有指定用户
    //   console.log('currentId: ', currentId);
    //   if (!loginInfo.uid || loginInfo.uid !== currentId) {
    //     initToDoList();
    //   } 
    //   initLocalStorage(currentId, result => {
    //     dispatch('hideLoading')
    //     if(result) {
    //       dispatch('initNimSDK', {
    //         uid: currentId,
    //         sdktoken: storage.get('sdktoken'),
    //       })
    //     } else {
    //       // pageUtil.turnPage('请重新登录', 'login')
    //       window.parent.postMessage('backtoHomepage', '*')
    //     }
    //   })
    //   // else {
    //   //   dispatch('initNimSDK', loginInfo)
    //   // }
    // } else { // 参数里无指定用户
    //   dispatch('hideLoading')
      
    //   if (!loginInfo.uid) {
    //     // 无cookie，直接跳转登录页
    //     // pageUtil.turnPage('无历史登录记录，请重新登录', 'login')
    //     window.parent.postMessage('backtoHomepage', '*')
    //   } else {
    //     // 有cookie，重新登录
    //     dispatch('initNimSDK', loginInfo)
    //   }
    // }
  }
}

function connectChatroom ({state, commit, dispatch}, obj) {
  let {chatroomId} = Object.assign({}, obj)
  const nim = state.nim
  if (nim) {
    // dispatch('showLoading')
    nim.getChatroomAddress({
      chatroomId,
      done: function getChatroomAddressDone (error, obj) {
        if (error) {
          alert(error.message)
          location.href = '#/room'
          return
        }
        dispatch('initChatroomSDK', obj)
      }
    })
  }
}

export default {
  updateRefreshState ({commit}) {
    commit('updateRefreshState')
  },

  // UI 及页面状态变更
  showLoading,
  hideLoading,
  showFullscreenImg,
  hideFullscreenImg,
  continueRobotMsg,

  // 连接sdk请求，false表示强制重连
  connect (store, obj) {
    let {type} = Object.assign({}, obj)
    // type 可为 nim chatroom
    type = type || 'nim'
    switch (type) {
      case 'nim':
        connectNim(store, obj)
        break
      case 'chatroom':
        connectChatroom(store, obj)
        break
    }
  },

  // 用户触发的登出逻辑
  logout ({ state, commit }) {
    storage.del('uid')
    storage.del('sdktoken')
    // cookie.delCookie('uid')
    // cookie.delCookie('sdktoken')
    if (state.nim) {
      state.nim.disconnect()
    }
    pageUtil.turnPage('', 'login')
  },

  // 初始化 重新连接SDK
  initNimSDK,
  // 清空所有搜索历史纪录
  resetSearchResult,
  // 搜索用户信息
  searchUsers,
  // 更新黑名单
  updateBlack,
  // 更新好友
  addFriend,
  deleteFriend,
  updateFriend,
  // 删除会话
  deleteSession,
  // 设置当前会话
  setCurrSession,
  // 重置当前会话
  resetCurrSession,
  // 发送消息
  sendMsg,
  sendFileMsg,
  sendRobotMsg,
  // 发送消息已读回执
  sendMsgReceipt,
  // 消息撤回
  revocateMsg,
  // 更新本地消息
  updateLocalMsg,
  getHistoryMsgs,
  // 重置历史消息状态
  resetNoMoreHistoryMsgs,
  // 标记系统消息已读
  markSysMsgRead,
  markCustomSysMsgRead,
  resetSysMsgs,
  deleteSysMsgs,

  initChatroomSDK,
  initChatroomInfos,
  resetChatroomSDK,
  sendChatroomMsg,
  sendChatroomRobotMsg,
  sendChatroomFileMsg,
  getChatroomHistoryMsgs,
  getChatroomInfo,
  getChatroomMembers,
  clearChatroomMembers,


  // 搜索群
  searchTeam,
  // 代理sdk中的群方法
  delegateTeamFunction,
  // 处理群消息回调
  onTeamNotificationMsg,
  // 进入群信息设置页
  enterSettingPage,
  // 获取群成员
  getTeamMembers,
  // 群消息回执检查
  checkTeamMsgReceipt,
  // 查询群消息回执已读列表
  getTeamMsgReads,

}
