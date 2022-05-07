import React, { useEffect, useState } from 'react'
import './Login.css'
// @ts-ignore
import { useNavigate } from 'react-router-dom'
import { BrowserType } from './utils'
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
const browserType=BrowserType()
function Login() {
  const to = useNavigate()
  return (
    <div className='login-wrapper'>
      <div className='login-form-wrapper'>
        <div className='title'>mushroom</div>
        <div className='login-form'>
          <div className='form-option'>
            <h4>用户名</h4>
            <input type="text" id='name' placeholder='输入用户名' required />
          </div>
          <div className='form-option' style={{display:'none'}}>
            <h6>房间号</h6>
            <input type="text" id='num' placeholder='输入房间号' required />
          </div>
          <div className={`form-option radio-option ${browserType==='oculus'?'hiden':''}`} >
            <span>观众访问？</span>
            <input type="radio" id='auth' name='auth' value='true' />
          </div>

          <button className="btn"
            onClick={() => {
              const username = (document.getElementById('name') as HTMLInputElement).value;
              const roomid = (document.getElementById('num') as HTMLInputElement).value;
              const isAudience =browserType==='oculus'|| (document.getElementById('auth') as HTMLInputElement).checked;

              //  userLogin(username)
              to('/room', {
                state: {
                  username,
                  roomid,
                  isAudience,
                  browserType
                }
              })

            }}>
            进入房间
          </button>
          <div className='hide' >
            <div>{BrowserType()}</div>
            <div>{
              //@ts-ignore
              `webkitSpeechRecognition ${window.webkitSpeechRecognition ? 'ok' : 'no'}`
            }
            </div>
            <div>
              {
                //@ts-ignore
                `requestAnimationFrame ${window.requestAnimationFrame ? 'ok' : 'no'}`
              }

            </div>
            <div>
              {
                //@ts-ignore
               `requestVideoFrameCallback ${document.createElement('video').requestVideoFrameCallback ? 'ok' : 'no'}`
              }
            </div>
          </div>
        </div>


      </div>
      <div className='login-img'>
        <div className='info'>
          <div className='title'>mushroom</div>
          <div>
            三维视频会议室
          </div>
        </div>
        <img src="/viewfile.png" alt="#" />

      </div>
    </div>
  )
}
export default Login
