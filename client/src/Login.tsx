import React, { useEffect, useState } from 'react'
import './Login.css'
// @ts-ignore
import { useNavigate } from 'react-router-dom'
import socket from "./modules/Socket/index"
import ee from './modules/eventEmitter'
import {
  CLIENT_RTC_EVENT,
  SERVER_RTC_EVENT,

  CLIENT_USER_EVENT,
  SERVER_USER_EVENT,
  CLIENT_USER_EVENT_LOGIN,
  SERVER_USER_EVENT_UPDATE_USERS,
  CLIENT_USER_EVENT_SEND_MESSAGE,
  SIGNALING_OFFER,
  SIGNALING_ANSWER,
  SIGNALING_CANDIDATE,
} from './modules/constant'
const ROOMID = 100;
function userLogin(loginName: String) {
  sendUserEvent({
    type: CLIENT_USER_EVENT_LOGIN,
    payload: {
      loginName: loginName,
      roomID: ROOMID
    }
  });
}
function sendUserEvent(msg: any) {
  socket.emit(CLIENT_USER_EVENT, JSON.stringify(msg));
}
function Login() {
  const to = useNavigate()
  const [server_rtc_payload, set_server_rtc_payload] = useState<any>()
  useEffect(() => {
    socket.on("FIRSTASKLIST", (payload) => {
      console.log('User first time get all online users list')
      set_server_rtc_payload(payload)
      // updateUserList(payload, updateNewEnterTip);
      // initRTC(payload.onlineUsers)
    })
  }, [])
  return (
    <div className='login-wrapper'>
      <div className='login-form-wrapper'>
      <div className='title'>mushroom</div>
        <div className='login-form'>
          <div className='form-option'>
            <h6>用户名</h6>
            <input type="text" id='name' placeholder='输入用户名' required />
          </div>
          <div className='form-option'>
            <h6>房间号</h6>
            <input type="text" id='num' placeholder='输入房间号' required />
          </div>
     
            <button className="btn"
              onClick={() => {
                const username = (document.getElementById('name') as HTMLInputElement).value;
                const roomid = (document.getElementById('num') as HTMLInputElement).value;

                console.log(username, roomid)
                userLogin(username)
                to('/room', {
                  state: {
                    username,
                    roomid,
                    payload: server_rtc_payload
                  }
                })

              }}>
              进入房间
            </button>
          
        </div>


      </div>
      <div className='login-img'>
      <div className='info'>
          <div className='title'>mushroom</div>
          <div>
            三维视频会议室
          </div>
        </div>
        <img src="viewfile.png" alt="#" />
 
      </div>
    </div>
  )
}
export default Login
