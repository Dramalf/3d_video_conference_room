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
import {useLocation,useParams} from'react-router-dom'
// @ts-ignore
import * as humanseg from '@paddlejs-models/humanseg';

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
const ROOMID = 100
function App() {
  const location:any=useLocation()
  console.log(location)

  const [participantsList, setParticipantsList] = useState<Array<String>>(["123"])
  const [userName, setUserName] = useState<String>(location.state.username)
  const [isLock, setisLock] = useState(false)
  let peerList: any = {};
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

  function init() {
    login(userName)
    
  }
  function sendRTCEvent(msg: any) {
    socket.emit(CLIENT_RTC_EVENT, JSON.stringify(msg));
  }

  function log(msg: string) {
    // console.log(`[client] ${msg}`);
  }

  function createPeerConnection(remoteUserName: String) {
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
      log(`ontrack.`);
      let remoteVideo: HTMLVideoElement | null = document.querySelector(`#${remoteUserName}`)
      if (remoteVideo) {
        if (remoteVideo.srcObject) return
        remoteVideo.srcObject = evt.streams[0];
      } else {
        remoteVideo = document.createElement('video');
        remoteVideo.srcObject = evt.streams[0];
        remoteVideo.muted = true;
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.width = 64;
        remoteVideo.height = 48;
        remoteVideo.id = remoteUserName as string;
        const videoWrapper = document.createElement("div")
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

    await pc.setRemoteDescription(remoteDescription); // TODO 错误处理

    // 本地音视频采集
    const localVideo: HTMLVideoElement = document.getElementById('local-video') as HTMLVideoElement;
    // const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // (localVideo as HTMLVideoElement).srcObject = mediaStream;
    const mediaStream = (localVideo as HTMLVideoElement).srcObject as MediaStream;
    console.log('get mediastream')
    mediaStream.getTracks().forEach(track => {
      pc.addTrack(track, mediaStream);
      //pc.addTransceiver(track, {streams: [mediaStream]}); // 这个也可以
    });
    // pc.addStream(mediaStream); // 目前这个也可以，不过接口后续会废弃

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
    const mediaStream = await navigator.mediaDevices.getUserMedia({
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
    ee.emit("VIDEO_READY", localVideo, userName as string)
    if (onlineUsers.length > 1) {

      onlineUsers.forEach((onlineUser: { userName: any; }) => {
        const { userName: rtcUserName } = onlineUser
        if (!peerList[rtcUserName] && rtcUserName !== userName) {

          let pc: RTCPeerConnection = createPeerConnection(rtcUserName)

          // 将媒体流添加到webrtc的音视频收发器
          mediaStream.getTracks().forEach(track => {
            pc.addTrack(track, mediaStream);
            // pc.addTransceiver(track, {streams: [mediaStream]});
          });
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
      console.log('SERVER_RTC_EVENT')
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
    const {payload}=location.state
    updateUserList(payload, updateNewEnterTip);
    initRTC(payload.onlineUsers)

    return () => {
      socket.removeAllListeners()

    }
  },[])

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
      const canvas = document.createElement('canvas')
      canvas.style.position = 'fixed'
      canvas.style.zIndex = '100'
      canvas.style.top = '10px'
      canvas.style.right = '50px'
      console.log(name, "***")
      video.onloadeddata = async () => {
        
        TE.addUserVideo(canvas, name)
        blurBackground(video,canvas,()=>{
          TE.updateUserTexture(canvas,name)
        })
        console.log("loaded video")
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
  async function blurBackground(video:any,canvas:any,cb=()=>{}) {
    await humanseg.load();
    async function cutout() {
      try {
        const { data } = await humanseg.getGrayValue(video);
        //console.log(data);
          humanseg.drawHumanSeg(data, canvas);
          cb()
      } catch (error) {
        console.log(error);
      }

      requestAnimationFrame(cutout)
    }
    cutout()

  }

  return (
    <div className="App">
      <div className="conference-header-wrapper">
        欢迎{userName}
      </div>
      <div className="conference-body-wrapper">
        <div className="conference-participants-list-wrapper">
          <ParticipantsList participantsList={participantsList} />
        </div>
        <div className="conference-panel-wrapper">
          <div className="conference-webgl-wrapper"></div>
          <div className="conference-textchat-wrapper">
            <ChatBox userName={userName} />
          </div>
        </div>
      </div>
      <div className="conference-footer-wrapper" onClick={() => {
        console.log(peerList)
      }}>
        底部
      </div>
    </div>
  );
}

export default App;
