import React, { Component, useState, useEffect } from 'react';
import socket from "./modules/Socket/index"
import ee from './modules/eventEmitter'
import './App.css';
import ChatBox from "./components/ChatBox"
import Tips from './components/Tips';
import ToggleBtn from './components/ToggleBtn';
import ParticipantsList from './components/ParticipantsList';
import { TEngine } from "./modules/TEngine/TEngine"
import { FaceAPI } from './modules/FaceAPI/FaceAPI';
import { HandAPI } from './modules/HandAPI/HandAPI';
import { basicObjectList } from './modules/TEngine/TBasicObject'
import { LightsList } from './modules/TEngine/Tlights'
import { helperList } from './modules/TEngine/THelper'
import { useLocation, useParams } from 'react-router-dom'
// @ts-ignore
import * as humanseg from '@paddlejs-models/humanseg';
import { VCAPI } from './modules/VoiceControlAPI/VCAPI'
import { RTCEngine } from './modules/RTCEngine/RTCEngine';
import {
  CLIENT_RTC_EVENT,
  SERVER_RTC_EVENT,
  CLIENT_USER_EVENT_INTERACTION,
  CLIENT_USER_EVENT,
  SERVER_USER_EVENT,
  CLIENT_USER_EVENT_LOGIN,
  SERVER_USER_EVENT_UPDATE_USERS,
  CLIENT_USER_EVENT_SEND_MESSAGE,
  SIGNALING_OFFER,
  SIGNALING_ANSWER,
  SIGNALING_CANDIDATE,
} from './modules/constant'
const ROOMID = 100

function App() {
  const location: any = useLocation()
  const { isAudience, browserType } = location.state;
  const sceneList = {
    '林间晨光': 'autumn_forest_04_1k',
    '黄昏郊野': 'railway_bridges_1k',
    '宁静湖畔': 'bell_park_pier_1k'
  }

  const [participantsList, setParticipantsList] = useState<Array<String>>([""])
  const [userName, setUserName] = useState<string>(location.state.username)

  const [curScene, setCurScene] = useState('林间晨光')
  let peerList: any = {};
  let videoList: any = {};



  //
  useEffect(() => {
    async function start() {
      let client = new RTCEngine(socket, ee);
      client.onnewuserenterroom = (e: any) => {
        console.log('有人来了', e);
        setParticipantsList(e.onlineUsers.map((u: any) => u.userName))
      }
      client.onnewvideoloaded = (e: any) => {
        console.log('视频准备好了', e)
        const { video, video_name } = e
        ee.emit("VIDEO_READY", video, video_name);
      }
      client.onuserleaveroom = (e: any) => {
        ee.emit('USER_LEAVE', e);
      }
      client.onuserinteraction=(e:any)=>{
        ee.emit('START_LOVE',e);
      }
      await new Promise((resolve, reject) => {
        if (isAudience) {
          (document.querySelector('.tips-wrapper') as HTMLDivElement).style.display = 'none';
          resolve(0);
        }
        else {
          (document.querySelector('.tips-enter-btn') as HTMLDivElement).onclick = () => {
            (document.querySelector('.tips-wrapper') as HTMLDivElement).style.display = 'none';
            resolve(0);
          }
        }
      })

      client.login(userName, '100', isAudience ? undefined : await createLocalVideo())

    }
    start()
  }, [])
  async function createLocalVideo() {
    try {
      await humanseg.load(true, true);
    } catch (error) {
      console.log('in humanseg', error)
    }
    const mediastream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    let w = mediastream.getVideoTracks()[0].getSettings().width as number / 2;
    let h = mediastream.getVideoTracks()[0].getSettings().height as number / 2;
    const hc = document.createElement('canvas');
    hc.width = w;
    hc.height = h;
    const mc = document.createElement('canvas');
    mc.width = w;
    mc.height = h;
    const bc = document.createElement('canvas');
    bc.width = w;
    bc.height = h;
    const local_video = document.createElement('video');
    local_video.muted = true;
    local_video.autoplay = true;

    local_video.width = w;
    local_video.height = h;
    const segment_video = document.createElement('video');
    segment_video.width = w;
    segment_video.height = h;
    local_video.srcObject = mediastream;
    local_video.play();
    segment_video.srcObject = hc.captureStream();
    segment(local_video, hc, mc, bc, () => { });
    ee.emit("LOCAL_VIDEO",local_video)
    segment_video.onloadeddata = () => {
      console.log('seg loaded')
      segment_video.play();
      ee.emit("VIDEO_READY", segment_video, userName as string)
    }
    return segment_video
  }

  function cleanGreen(v: HTMLVideoElement, rv: HTMLVideoElement) {
    const displayCanvasEl = document.createElement('canvas');
    const c=document.createElement('canvas');
    c.width=320;
    c.height=240;
    // displayCanvasEl.classList.add('test')
   // rv.srcObject=c.captureStream();
    // document.body.appendChild(displayCanvasEl)
    rv.srcObject = displayCanvasEl.captureStream();
    const gl = displayCanvasEl.getContext("webgl") as WebGLRenderingContext;
    const vs = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(vs, 'attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }');
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(fs, document.getElementById("fragment-shader")!.innerText);
    gl.compileShader(fs);
    const prog = gl.createProgram() as WebGLProgram;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const coordLoc = gl.getAttribLocation(prog, 'c');
    gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordLoc);

    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const texLoc = gl.getUniformLocation(prog, "tex");
    const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
    const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
    function processFrame(now: any, metadata: any) {
      displayCanvasEl.width = metadata.width;
      displayCanvasEl.height = metadata.height;
      gl.viewport(0, 0, metadata.width, metadata.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
      gl.uniform1i(texLoc, 0);
      gl.uniform1f(texWidthLoc, metadata.width);
      gl.uniform1f(texHeightLoc, metadata.height);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      //@ts-ignore
      v.requestVideoFrameCallback(processFrame);
      //c.getContext('2d')?.clearRect(0,0,320,240)
       //c.getContext('2d')?.drawImage(v,0,0);
     
    }
    //@ts-ignore
    v.requestVideoFrameCallback(processFrame);

    console.log('执行了')
  }

  //3d场景生成
  useEffect(() => {

    const threeTarget = document.querySelector(".conference-webgl-wrapper")
    const TE = new TEngine(threeTarget as HTMLElement, isAudience, browserType)

    TE.loadRoom(() => {
      document.querySelector('.mask')?.classList.remove('mask');
    })

    //TE.loadHumanModel()
    TE.addObject(...basicObjectList)
    TE.addObject(...LightsList)
    TE.addObject(...helperList)
    TE.loadLove()
    ee.on("TRIGGER_GESTURE", () => {
     
      let targetName=TE.getCentralUser();
      targetName&&TE.startLove("&&SELF",targetName)
      let msg={
        type:CLIENT_USER_EVENT_INTERACTION,
        payload:{
          from:userName,
          to:targetName
        }
      }
      targetName&&socket.emit(CLIENT_USER_EVENT,JSON.stringify(msg))
    })

    ee.on("CHANGE_SCENE", (url: string) => {
      TE.changeScene(url);
    });
    ee.on("ADJUST_BRIGHTNESS", (type: string) => {
      TE.adjustBrightness(type)
    })
    ee.on('USER_LEAVE', (leaveName: string) => {
      TE.removeUserVideo(leaveName);
    })
    ee.on('SWITCH_VR',(vr:boolean)=>{
      TE.switchVRview(vr);
    })
    ee.on("START_LOVE",(from:string)=>{
      TE.startLove(from,userName);
    })
    ee.on("VIDEO_READY", (video: HTMLVideoElement, name: string) => {
      //       const canvas = document.createElement('canvas');
      console.log(video, name)
      const resultVideo = document.createElement('video')
      resultVideo.width = video.width;
      resultVideo.muted = true;
      resultVideo.height = video.height;
      cleanGreen(video, resultVideo);
      resultVideo.onloadeddata = () => {
        resultVideo.play()
        TE.addUserVideo(resultVideo, name)
      }
    })
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 27) {

        TE.disableControls()

      } else if (e.keyCode === 17) {
        TE.enableControls()
      }
    })
  }, [])

  //语音识别控制
  useEffect(() => {
    //@ts-ignore
    if (window.webkitSpeechRecognition) {
      let VC = new VCAPI()
      VC.start()
      console.log('vc open')
      VC.bindListening('亮一点', () => {
        console.log('捕捉到了>>>亮一点')
        ee.emit('ADJUST_BRIGHTNESS', 'brighter')
      })
      VC.bindListening('暗一点', () => {
        console.log('捕捉到了>>>暗一点')
        ee.emit('ADJUST_BRIGHTNESS', 'darker')
      })
    }

  }, [])

  //手势识别
  useEffect(() => {
    let hd=new HandAPI();
    ee.on("LOCAL_VIDEO", async (video: HTMLVideoElement) => {
    
      (await hd.createDetector()).bindVideo(video).onDetect(() => {
        ee.emit("TRIGGER_GESTURE")
        console.log('***&&&')
      })

    })
    ee.on('SWITCH_DETECT',(e:boolean)=>{
      hd.enable=e
    })
  }, [])

  async function segment(video: HTMLVideoElement, humanCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, backgroundCanvas: HTMLCanvasElement, cb = (e: any) => { }) {
    async function cutout() {
      try {
        const { data } = await humanseg.getGrayValue(video);
        humanseg.drawHumanSeg(data, humanCanvas);

        // humanseg.drawMask(data,maskCanvas,backgroundCanvas);
        // cb(data)
      } catch (error) {
        console.log(error);
      }

      requestAnimationFrame(cutout)
    }
    // document.body.appendChild(humanCanvas);
    humanCanvas.classList.add('testa')
    cutout()
  }


  return (
    <div className="App sm-app">
      <div className='app-main-box sm-app-main-box'>
        <div className="conference-header-wrapper" >
          <div className='header-item' onClick={() => {

          }}>欢迎{userName}</div>
          <div className='header-item dropdown'>
            <h5>{curScene}</h5>
            <div className='dropdown-content'>
              {
                Object.keys(sceneList).map((key) => {
                  return (
                    <p onClick={() => {
                      setCurScene(key);
                      //@ts-ignore
                      ee.emit('CHANGE_SCENE', sceneList[key])
                    }}>{key}</p>
                  )
                })
              }
            </div>

          </div>
          <div className='header-item'>
            <ToggleBtn l={'VR'} r={"2d"} onToggle={(vr:any)=>{
              ee.emit('SWITCH_VR',vr)
            }}/>
          </div>
          <div className='header-item'>
            <ToggleBtn l={'🤞🏿'} r={"🚫"} onToggle={(e:any)=>{
              ee.emit('SWITCH_DETECT',e)
            }}/>
          </div>
        </div>
        <div className="conference-body-wrapper mask" data-loadinfo="三维会议室加载中">
          <Tips ></Tips>
          <div className="conference-webgl-wrapper"></div>

        </div>
        <div className="conference-footer-wrapper" onClick={() => {

        }}>
          <div className='function-btn selected' onClick={(e) => {
            const dom = e.target as HTMLDivElement;
            const selected = dom.classList.contains('selected');
            const chatBoxDom = document.querySelector('.conference-textchat-wrapper') as HTMLDivElement;
            const addSpace = document.querySelector('.userlist-btn')?.classList.contains('selected') && !selected;
            addSpace && chatBoxDom.classList.add('add-space');
            !addSpace && chatBoxDom.classList.remove('add-space');
            console.log(addSpace)
            if (selected) {
              dom.classList.remove('selected');
              chatBoxDom.classList.add('hide');

            } else {
              dom.classList.add('selected');

              chatBoxDom.classList.remove('hide');

            }
          }}>
            💬
          </div>
          <div className='userlist-btn function-btn ' onClick={(e) => {
            const dom = e.target as HTMLDivElement;
            const selected = dom.classList.contains('selected');
            const listDom = document.querySelector('.conference-participants-list-wrapper') as HTMLDivElement;
            const chatBoxDom = document.querySelector('.conference-textchat-wrapper') as HTMLDivElement;
            const addSpace = !chatBoxDom.classList.contains('hide') && !selected;
            addSpace && chatBoxDom.classList.add('add-space');
            !addSpace && chatBoxDom.classList.remove('add-space');
            if (selected) {
              dom.classList.remove('selected');
              listDom.classList.add('hide');
            } else {
              dom.classList.add('selected');
              listDom.classList.remove('hide');
            }
          }} >
            👥
          </div>
        </div>
      </div>
      <div className='app-function-box sm-app-function-box'>
        <div className="conference-participants-list-wrapper sm-conference-participants-list-wrapper hide">
          <ParticipantsList participantsList={participantsList} />
        </div>
        <div className="conference-textchat-wrapper sm-conference-textchat-wrapper">
          <ChatBox userName={userName} />
        </div>
      </div>

    </div>
  );
}

export default App;
