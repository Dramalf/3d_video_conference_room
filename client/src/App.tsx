import React, { Component, useState, useEffect } from 'react';
import socket from "./modules/Socket/index"
import ee from './modules/eventEmitter'
import randomName from './modules/randomName';
import './App.css';
import ChatBox from "./components/ChatBox"
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
import { setInterval } from 'timers';
const ROOMID = 100
let segdata: any;
function App() {
  const location: any = useLocation()



  const [participantsList, setParticipantsList] = useState<Array<String>>(["123"])
  const [userName, setUserName] = useState<string>(location.state.username)
  const [hasSelect, setHasSelect] = useState(true)
  let peerList: any = {};
  let videoList: any = {};
  let channelList: any = {};
  let remoteChannelList: any = {};
  function sendUserEvent(msg: any) {
    socket.emit(CLIENT_USER_EVENT, JSON.stringify(msg));
  }

  function updateUserList(payload: any, callback: Function) {
    let { onlineUsers, newEnterUserName } = payload
    if (!newEnterUserName) {
      newEnterUserName = userName
      onlineUsers.push({ userName, roomID: ROOMID })
    }

    onlineUsers && setParticipantsList(onlineUsers.map((user: { userName: any; }) => user.userName));
    callback(newEnterUserName);
  }

  function login(loginName: String) {
    sendUserEvent({
      type: CLIENT_USER_EVENT_LOGIN,
      payload: {
        loginName: loginName,
        roomID: ROOMID
      }
    });
  }


  function sendRTCEvent(msg: any) {
    socket.emit(CLIENT_RTC_EVENT, JSON.stringify(msg));
  }

  function log(msg: string) {
    // console.log(`[client] ${msg}`);
  }

  function createPeerConnection(remoteUserName: string) {
    const iceConfig = {
      "iceServers": [
        { url: 'stun:stun.ekiga.net' },
        { url: 'turn:turnserver.com', username: 'user', credential: 'pass' }
      ]
    } as unknown as RTCConfiguration

    let pc: RTCPeerConnection = new RTCPeerConnection(iceConfig);

    pc.onnegotiationneeded = onnegotiationneeded;
    pc.onicecandidate = onicecandidate;
    pc.onicegatheringstatechange = onicegatheringstatechange;
    pc.oniceconnectionstatechange = oniceconnectionstatechange;
    pc.onsignalingstatechange = onsignalingstatechange;
    pc.ontrack = ontrack;
    async function onnegotiationneeded(e: any) {
      log(`onnegotiationneeded.${e}`);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer); // TODO 错误处理

      sendRTCEvent({
        type: SIGNALING_OFFER,
        payload: {
          from: userName,
          target: remoteUserName,
          sdp: pc.localDescription // TODO 直接用offer？
        }
      });
    }
    function onicecandidate(evt: any) {
      if (evt.candidate) {
        //log(`onicecandidate.`);

        sendRTCEvent({
          type: SIGNALING_CANDIDATE,
          payload: {
            from: userName,
            target: remoteUserName,
            candidate: evt.candidate
          }
        });
      }
    }

    function onicegatheringstatechange(evt: any) {
      log(`onicegatheringstatechange, pc.iceGatheringState is ${(pc as RTCPeerConnection).iceGatheringState}.`);
    }

    function oniceconnectionstatechange(evt: any) {
      log(`oniceconnectionstatechange, pc.iceConnectionState is ${(pc as RTCPeerConnection).iceConnectionState}.`);
    }

    function onsignalingstatechange(evt: any) {
      log(`onsignalingstatechange, pc.signalingstate is ${(pc as RTCPeerConnection).signalingState}.`);
    }
    function ontrack(evt: any) {
      let remoteVideo: HTMLVideoElement | null = document.querySelector(`#${remoteUserName}`)
      let nv: HTMLVideoElement = document.createElement('video');
      // console.log(evt,"evt%%##")
      // nv.srcObject=evt.streams[1];
      // nv.width=640;
      // nv.height=480;
      // (document.querySelector(".conference-header-wrapper") as HTMLElement).appendChild(nv);
      // nv.play()

      // nv.id='nv'
      if (remoteVideo) {
        if (remoteVideo.srcObject) return
        remoteVideo.srcObject = evt.streams[0];
      } else {
        remoteVideo = document.createElement('video');
        remoteVideo.srcObject = evt.streams[0];
        remoteVideo.muted = true;
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.width = 640;
        remoteVideo.height = 480;
        remoteVideo.id = remoteUserName as string;
        const videoWrapper = document.createElement("div")
        videoWrapper.style.display='none'
        const userTag = document.createElement("p")
        userTag.innerText = remoteUserName as string;
        videoWrapper.appendChild(userTag);
        videoWrapper.appendChild(remoteVideo);
        (document.querySelector(".conference-webgl-wrapper") as HTMLElement).appendChild(videoWrapper)
        remoteVideo.play()

        ee.emit("VIDEO_READY", remoteVideo, remoteUserName as string)
      }

    }
    return pc;
  }
  async function handleReceiveOffer(msg: any) {
    //log(`receive remote description from ${msg.payload.from}`);

    // 设置远端描述
    //const remoteDescription = new RTCSessionDescription(msg.payload.sdp);
    const remoteDescription = msg.payload.sdp;
    let remoteUser = msg.payload.from;
    console.log(peerList, "peerList")
    if (peerList[remoteUser]) return
    let pc: RTCPeerConnection = createPeerConnection(remoteUser);
    peerList[remoteUser] = pc

    // let dataChannel = pc.createDataChannel('local', { ordered: false })

    // dataChannel.onopen = (e) => {
    //   console.log('open datachannel', e)

    //   // //在这里发送本地分割后的data
    //   // setInterval(() => {
    //   //   console.log('first',segdata)
    //   //   dataChannel.readyState === 'open' && dataChannel.send(segdata);
    //   // }, 30)
    //   // //  dataChannel.send("can u here!");

    // };
    // pc.ondatachannel = (e) => {
    //   console.log("local pc ondatachannel", e)
    //   const dc = e.channel;
    //   dc.onmessage = (event) => {
    //     console.log("local pc recieve:", event.data);
    //   };
    // }
    await pc.setRemoteDescription(remoteDescription); // TODO 错误处理

    // 本地音视频采集

    const mediaStream = (videoList['local-video'] as HTMLVideoElement).srcObject
    // const mediaStream = (document.getElementById('sv') as HTMLVideoElement).srcObject;
    // @ts-ignore
    mediaStream.getTracks().forEach(track => {
      // @ts-ignore
      pc.addTrack(track, mediaStream);

    });

    const answer = await pc.createAnswer(); // TODO 错误处理
    await pc.setLocalDescription(answer);
    sendRTCEvent({
      type: SIGNALING_ANSWER,
      payload: {
        sdp: answer,
        from: userName,
        target: remoteUser
      }
    });
  }

  async function handleReceiveAnswer(msg: any) {
    log(`receive remote answer from ${msg.payload.from}`);

    // const remoteDescription = new RTCSessionDescription(msg.payload.sdp);
    const remoteDescription = msg.payload.sdp;
    let remoteUser = msg.payload.from;
    if (peerList[remoteUser].signalingState !== "stable")
      await peerList[remoteUser].setRemoteDescription(remoteDescription); // TODO 错误处理
  }

  async function handleReceiveCandidate(msg: any) {
    log(`receive candidate from ${msg.payload.from}`);
    peerList[msg.payload.from].addIceCandidate(msg.payload.candidate); // TODO 错误处理
  }
  interface onlineUseT {
    userName: String,
    roomID: any
  }
  async function initRTC(onlineUsers: Array<onlineUseT>) {
    const localVideo = document.createElement('video')
    let mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localVideo.srcObject = mediaStream;
    localVideo.muted = true;
    localVideo.autoplay = true;
    localVideo.width = 640;
    localVideo.height = 480;
    localVideo.id = "local-video";
    const videoWrapper = document.createElement("div")
    const userTag = document.createElement("p")
    userTag.innerText = "local-video";
    videoWrapper.appendChild(userTag);
    videoWrapper.appendChild(localVideo);
    videoWrapper.style.display = "none";
    localVideo.play();
    (document.querySelector(".conference-webgl-wrapper") as HTMLElement).appendChild(videoWrapper)



    videoList['local-video'] = localVideo
    // const hc = document.createElement('canvas');
    // hc.width = 640;
    // hc.height = 480;
    // const mc=document.createElement('canvas');
    // mc.width=640;
    // mc.height=480;
    // const bc=document.createElement('canvas');
    // bc.width=640;
    // bc.height=480;
    // bc.getContext('2d')!.fillStyle = "red";
    // bc.getContext('2d')!.fillRect(0,0,640,480)

    // const rc=document.createElement('canvas');
    // rc.width=640;
    // rc.height=480;
    // segment(localVideo,hc,mc,bc,()=>{
    //   // const w=mc.width;
    //   // const h=mc.height;
    //   // console.log(w,h)
    //   // rc.getContext('2d')!.drawImage(mc,0,0,w,h,0,0,640,480)
    // });

    // // const v=lashen(mc);
    // console.log(mc.width,mc.height,"asdasd")
    // const v=document.createElement('video');
    // // v.width=mc.width
    // // v.height=mc.height;

    // v.srcObject=hc.captureStream();
    // v.onloadeddata=()=>{
    //   v.play()
    //   // ee.emit("VIDEO_READY", v, userName as string)
    // }
    // v.id='sv';
    // videoList['sv']=v;
    // (document.querySelector(".conference-header-wrapper") as HTMLElement).appendChild(v);
    ee.emit("VIDEO_READY", localVideo, userName as string)
    if (onlineUsers.length > 1) {

      onlineUsers.forEach((onlineUser: { userName: any; }) => {
        const { userName: rtcUserName } = onlineUser
        if (!peerList[rtcUserName] && rtcUserName !== userName) {

          let pc: RTCPeerConnection = createPeerConnection(rtcUserName)
          // let dataChannel = pc.createDataChannel('blurdata', { ordered: false })
          // console.log(dataChannel)
          // dataChannel.onmessage = (event) => {
          //   console.log("local in loop:", event.data);
          // };
          // // let count = 0
          // dataChannel.onopen = () => {
          //   console.log('open datachannel in loop')
          //   //新登入用户，在这里向所有人发送分割的data
          //   // const v = videoList['local-video'];
          //   // const canvas = document.createElement('canvas');
          //   // canvas.width = 640;
          //   // canvas.height = 480;

          //   // blurBackground(v, canvas, (data) => {
          //   //   dataChannel.readyState === 'open' && dataChannel.send(data)
          //   //   console.log(data)
          //   // })
          //   //  dataChannel.send("Hello World!");
          // };
          // pc.ondatachannel = (e) => {
          //   console.log("in loop channel", e)
          //   const channel = e.channel;
          //   channel.onmessage = (event) => {
          //     console.log("local in loop:", event.data);
          //   };
          // }


          // 将媒体流添加到webrtc的音视频收发器
          mediaStream.getTracks().forEach(track => {
            pc.addTrack(track, mediaStream);
          });
          // @ts-ignore
          // v.srcObject.getTracks().forEach(track => {
          //   pc.addTrack(track, mediaStream);
          // });
          peerList[rtcUserName] = pc
        }
      })

    }

  }

  //socket事件注册
  useEffect(() => {
    const msgbox: HTMLElement | null = document.querySelector(".chat-record-panel")
    const updateNewEnterTip = (newEnterUserName: String) => {
      (msgbox as HTMLElement).innerHTML += `<p>${newEnterUserName}进入房间</p>`
    }
    socket.on("FIRSTASKLIST", (payload) => {
      console.log('User first time get all online users list')
      updateUserList(payload, updateNewEnterTip);
      initRTC(payload.onlineUsers)
    })
    socket.on(SERVER_USER_EVENT, (msg) => {
      const { type, payload } = msg
      switch (type) {
        case SERVER_USER_EVENT_UPDATE_USERS:
          updateUserList(payload, updateNewEnterTip);
          break;
      }
    })
    socket.on(SERVER_RTC_EVENT, async function (msg) {
      const { type } = msg;
      switch (type) {
        case SIGNALING_OFFER:
          handleReceiveOffer(msg);
          break;
        case SIGNALING_ANSWER:
          await handleReceiveAnswer(msg);
          break;
        case SIGNALING_CANDIDATE:
          await handleReceiveCandidate(msg);
          break;
      }
    });
    //init()

    async function start() {
      try {
        await humanseg.load();
        const { payload } = location.state
        updateUserList(payload, updateNewEnterTip);
        initRTC(payload.onlineUsers)
      } catch (error) {
        console.log(error)
      }


    }
    start()
    return () => {
      socket.removeAllListeners()

    }
  }, [])

  //3d场景生成
  useEffect(() => {

    const threeTarget = document.querySelector(".conference-webgl-wrapper")
    const TE = new TEngine(threeTarget as HTMLElement)

    TE.loadRoom()

    //TE.loadHumanModel()
    TE.addObject(...basicObjectList)
    TE.addObject(...LightsList)
    TE.addObject(...helperList)
    ee.on("VIDEO_READY", (video: HTMLVideoElement, name: string) => {
      const canvas = document.createElement('canvas');
      const v = document.createElement('video')
      v.width = 640;
      v.muted = true;
      v.height = 480
      blurBackground(video, canvas)
      v.srcObject = canvas.captureStream()
      v.play()
      TE.addUserVideo(v, name)




      // setInterval(()=>{
      //   TE.updateUserTexture(canvas,name)
      // },30)
      // document.body.appendChild(canvas)
      // const canvas = document.createElement('canvas')
      // canvas.style.position = 'fixed'
      // canvas.style.zIndex = '100'
      // canvas.style.top = '10px'
      // canvas.style.right = '50px'
      // console.log(name, "***")
      // video.onloadeddata = async () => {

      // TE.addUserVideo(canvas, name)
      // blurBackground(video,canvas,()=>{
      // TE.updateUserTexture(canvas,name)
      // })
      // console.log("loaded video")
      //人像切割测试
      // await humanseg.load();
      // const { data } = await humanseg.getGrayValue(video);
      // humanseg.drawHumanSeg(data, canvas);
      //人脸识别测试
      // document.body.appendChild(canvas)
      //const FD = new FaceAPI(video, canvas)
      //await FD.loaded()
      // document.body.appendChild(FD.getFeatures())
      //  TE.loadHumanModel(FD.getFeatures())
      //手势识别测试
      // TE.drawFace();
      // const hd= new HandAPI();
      // (await hd.createDetector()).bindVideo(video).detect()
      // }

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
    let VC = new VCAPI()
    VC.start()
    VC.bindListening('亮一点', () => {
      console.log('捕捉到了>>>亮一点')
      // alert('量')
    })
  }, [])
  function lashen(canvas: HTMLCanvasElement) {
    const va = document.createElement('video');
    const vb = document.createElement('video');
    const c = document.createElement('canvas');
    const w = canvas.width;
    const h = canvas.height;
    va.width = w;
    va.height = h;
    vb.width = 640;
    vb.height = 480;
    c.width = 640;
    c.height = 480;
    va.srcObject = canvas.captureStream();
    function draw() {
      c.getContext('2d')!.drawImage(va, 0, 0, w, h, 0, 0, 640, 480);
      requestAnimationFrame(draw)
    }
    draw()
    vb.srcObject = c.captureStream()
    return vb
  }
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
    cutout()
  }
  async function blurBackground(video: HTMLVideoElement, canvas: HTMLCanvasElement, cb = (e: any) => { }) {

    let stream: MediaStream | null = null;


    async function cutout() {
      try {
        const { data } = await humanseg.getGrayValue(video);
        humanseg.drawHumanSeg(data, canvas);
        cb(data)
      } catch (error) {
        console.log(error);
      }

      requestAnimationFrame(cutout)
    }
    cutout()

  }

  return (
    <div className="App">
      <div className='app-main-box'>
        <div className="conference-header-wrapper" onClick={() => {
          console.log(segdata)
        }}>
          欢迎{userName}
        </div>
        <div className="conference-body-wrapper">

            <div className="conference-webgl-wrapper"></div>

        </div>
        <div className="conference-footer-wrapper" onClick={() => {

        }}>
          <div className='function-btn selected' onClick={(e)=>{
            const dom=e.target as HTMLDivElement;
            const selected=dom.classList.contains('selected');
            const chatBoxDom=document.querySelector('.conference-textchat-wrapper')as HTMLDivElement;
            const addSpace=document.querySelector('.userlist-btn')?.classList.contains('selected')&&!selected;
            addSpace&&chatBoxDom.classList.add('add-space');
            !addSpace&&chatBoxDom.classList.remove('add-space');
            console.log(addSpace)
            if(selected){
              dom.classList.remove('selected');
              chatBoxDom.classList.add('hide');
              
            }else{
              dom.classList.add('selected');
              
              chatBoxDom.classList.remove('hide');
              
            }
          }}>
          💬
          </div>
          <div className='userlist-btn function-btn ' onClick={(e)=>{
            const dom=e.target as HTMLDivElement;
            const selected=dom.classList.contains('selected');
            const listDom=document.querySelector('.conference-participants-list-wrapper')as HTMLDivElement;
            const chatBoxDom=document.querySelector('.conference-textchat-wrapper')as HTMLDivElement;
            const addSpace=!chatBoxDom.classList.contains('hide')&&!selected;
            addSpace&&chatBoxDom.classList.add('add-space');
            !addSpace&&chatBoxDom.classList.remove('add-space');
            if(selected){
              dom.classList.remove('selected');
              listDom.classList.add('hide');
            }else{
              dom.classList.add('selected');
              listDom.classList.remove('hide');
            }
          }} >
          👥
          </div>
        </div>
      </div>
      <div className='app-function-box'>
        <div className="conference-participants-list-wrapper hide">
          <ParticipantsList participantsList={participantsList} />
        </div>
        <div className="conference-textchat-wrapper">
          <ChatBox userName={userName} />
        </div>
      </div>

    </div>
  );
}

export default App;
