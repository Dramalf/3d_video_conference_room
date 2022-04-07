import {
    sendRTCEvent,
    sendUserEvent
}from './RTCUtils'
import socket from "../Socket/index"
import ee from '../eventEmitter'
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
} from '../constant'
export class RTCEngine{
    private peerList:Array<RTCPeerConnection>=[]
    private videoList:Array<HTMLVideoElement>=[]
    private userName:string=''
    constructor(userName:string){
        this.userName=userName;
        socket.on("FIRSTASKLIST", (payload) => {
            console.log('User first time get all online users list')
           // updateUserList(payload, updateNewEnterTip);
            //initRTC(payload.onlineUsers)
          })
          socket.on(SERVER_USER_EVENT, (msg) => {
            const { type, payload } = msg
            switch (type) {
              case SERVER_USER_EVENT_UPDATE_USERS:
              //  updateUserList(payload, updateNewEnterTip);
                break;
            }
          })
          socket.on(SERVER_RTC_EVENT, async  (msg) => {
            const { type } = msg;
            switch (type) {
              case SIGNALING_OFFER:
                this.handleReceiveOffer(msg);
                break;
              case SIGNALING_ANSWER:
                await this.handleReceiveAnswer(msg);
                break;
              case SIGNALING_CANDIDATE:
                await this.handleReceiveCandidate(msg);
                break;
            }
          });
    }

  createPeerConnection(remoteUserName: string) {
      const {userName}=this
    const iceConfig = {
      "iceServers": [
        { url: 'stun:stun.ekiga.net' },
        { url: 'turn:turnserver.com', username: 'user', credential: 'pass' }
      ]
    } as unknown as RTCConfiguration

    let pc: RTCPeerConnection = new RTCPeerConnection(iceConfig);

    pc.onnegotiationneeded = onnegotiationneeded;
    pc.onicecandidate = onicecandidate;
    pc.ontrack = ontrack;
    async function onnegotiationneeded(e: any) {
     
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

 
    function ontrack(evt: any) {
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
        remoteVideo.width = 640;
        remoteVideo.height = 480;
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
    async  handleReceiveOffer(msg: any){
        //log(`receive remote description from ${msg.payload.from}`);
    
        // 设置远端描述
        //const remoteDescription = new RTCSessionDescription(msg.payload.sdp);
        const remoteDescription = msg.payload.sdp;
        let remoteUser = msg.payload.from;
        if (this.peerList[remoteUser]) return
        let pc: RTCPeerConnection = this.createPeerConnection(remoteUser);
        this.peerList[remoteUser] = pc
    
        await pc.setRemoteDescription(remoteDescription); // TODO 错误处理
    
        // 本地音视频采集
    // @ts-ignore
        const mediaStream = (this.videoList['local-video'] as HTMLVideoElement).srcObject
    
        // @ts-ignore
        mediaStream.getTracks().forEach(track => {
          // @ts-ignore
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
            from: this.userName,
            target: remoteUser
          }
        });
      }
    async handleReceiveAnswer(msg: any) {
        // log(`receive remote answer from ${msg.payload.from}`);
     
         // const remoteDescription = new RTCSessionDescription(msg.payload.sdp);
         const peerList=this.peerList
         const remoteDescription = msg.payload.sdp;
         let remoteUser = msg.payload.from;
         if (peerList[remoteUser].signalingState !== "stable")
           await peerList[remoteUser].setRemoteDescription(remoteDescription); // TODO 错误处理
       }
     
    async handleReceiveCandidate(msg: any) {
     //   log(`receive candidate from ${msg.payload.from}`);
       this.peerList[msg.payload.from].addIceCandidate(msg.payload.candidate); // TODO 错误处理
      }  
      
}



