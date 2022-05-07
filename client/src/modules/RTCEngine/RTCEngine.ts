// import {
//   sendRTCEvent,
//   sendUserEvent
// } from './RTCUtils'
// import socket from "../Socket/index"
// import ee from '../eventEmitter'
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
import { Socket } from 'socket.io-client'

interface onlineUserT {
  userName: String,
  roomID: any
}
export class RTCEngine {
  private peerList:any={}
  private videoList:any={}
  private userName?: string 
  private local_video!: HTMLVideoElement
  private is_audience: Boolean = false
  private socket!: Socket
  private ee: any
  public onnewuserenterroom: any
  public onnewvideoloaded:any
  public onuserleaveroom:any
  constructor(socket: Socket, ee: any) {
    // this.userName = userName;
    this.ee = ee;
    this.socket = socket;
    // this.is_audience = is_audience;
    // this.local_video = local_video;
    socket.on("FIRSTASKLIST", (payload) => {
      console.log('User first time get all online users list')
      let data = JSON.parse(payload)
      this.onnewuserenterroom && this.onnewuserenterroom(data);
      this.initRTC(data.onlineUsers)
    })
    socket.on('user_leave',(leaveName:string)=>{
      console.log('in rtc ')
      this.onuserleaveroom&&this.onuserleaveroom(leaveName)
    })
    socket.on(SERVER_USER_EVENT, (msg) => {
      const { type, payload } = msg
      switch (type) {
        case SERVER_USER_EVENT_UPDATE_USERS:
          this.onnewuserenterroom && this.onnewuserenterroom(payload);
          break;
      }
    })
    socket.on(SERVER_RTC_EVENT, async (msg) => {
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
  private async initRTC(onlineUsers: Array<onlineUserT>) {
    const localVideo = this.local_video
    const is_audience = this.is_audience;
    if (onlineUsers.length > 1) {

      onlineUsers.forEach((onlineUser: { userName: any; }) => {
        const { userName: rtcUserName } = onlineUser
        if (!this.peerList[rtcUserName] && rtcUserName !== this.userName) {

          let pc: RTCPeerConnection = this.createPeerConnection(rtcUserName)
          this.peerList[rtcUserName] = pc
          if (!is_audience) {
            const mediaStream = this.local_video.srcObject as MediaStream
            mediaStream.getTracks().forEach(track => {
              pc.addTrack(track, mediaStream);
            });
          }

        }
      })

    }

  }

  login(user_name: string, room_id: string, video?: HTMLVideoElement) {
    if (video) {
      this.is_audience = false;
      this.local_video = video;
    } else {
      this.is_audience = true
    }
    this.userName=user_name
    const msg = {
      type: CLIENT_USER_EVENT_LOGIN,
      payload: {
        loginName: user_name,
        roomID: 100
      }
    }
    this.socket.emit(CLIENT_USER_EVENT, JSON.stringify(msg));
  }
  private createPeerConnection(remoteUserName: string) {
    const { userName } = this
    const iceConfig = {
      "iceServers": [
        { url: 'stun:stun.ekiga.net' },
        { url: 'turn:turnserver.com', username: 'user', credential: 'pass' }
      ]
    } as unknown as RTCConfiguration

    let pc: RTCPeerConnection = new RTCPeerConnection(iceConfig);


    const onnegotiationneeded=async (e: any)=>{

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer); // TODO 错误处理

      this.sendRTCEvent({
        type: SIGNALING_OFFER,
        payload: {
          from: userName,
          target: remoteUserName,
          sdp: pc.localDescription // TODO 直接用offer？
        }
      });
    }
    const onicecandidate=async (evt: any)=> {
      if (evt.candidate) {
        //log(`onicecandidate.`);

       this.sendRTCEvent({
          type: SIGNALING_CANDIDATE,
          payload: {
            from: userName,
            target: remoteUserName,
            candidate: evt.candidate
          }
        });
      }
    }


    const ontrack=(evt: any)=>{
      let remoteVideo: HTMLVideoElement | null = this.videoList[remoteUserName]

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
        this.videoList[remoteUserName]=remoteVideo;
        remoteVideo.play()
        this.onnewvideoloaded&&this.onnewvideoloaded({
          video:remoteVideo,
          video_name:remoteUserName
        })
        console.log(110,remoteUserName)
        // ee.emit("VIDEO_READY", remoteVideo, remoteUserName as string)
      }

    }

    pc.onnegotiationneeded = onnegotiationneeded;
    pc.onicecandidate = onicecandidate;
    pc.ontrack = ontrack;
    return pc;
  }
  async handleReceiveOffer(msg: any) {
    //log(`receive remote description from ${msg.payload.from}`);

    // 设置远端描述
    //const remoteDescription = new RTCSessionDescription(msg.payload.sdp);
    const remoteDescription = msg.payload.sdp;
    let remoteUser = msg.payload.from;
    console.log(remoteUser,msg,'120')
    if (this.peerList[remoteUser]) return
    let pc: RTCPeerConnection = this.createPeerConnection(remoteUser);
    this.peerList[remoteUser] = pc

    await pc.setRemoteDescription(remoteDescription); // TODO 错误处理

    // 本地音视频采集
    if(!this.is_audience&&this.local_video){
      const mediaStream = this.local_video.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
      });
    }

    const answer = await pc.createAnswer(); // TODO 错误处理
    await pc.setLocalDescription(answer);
    this.sendRTCEvent({
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
    const peerList = this.peerList
    const remoteDescription = msg.payload.sdp;
    let remoteUser = msg.payload.from;
    if (peerList[remoteUser].signalingState !== "stable")
      await peerList[remoteUser].setRemoteDescription(remoteDescription); // TODO 错误处理
  }

  async handleReceiveCandidate(msg: any) {
    //   log(`receive candidate from ${msg.payload.from}`);
    this.peerList[msg.payload.from].addIceCandidate(msg.payload.candidate); // TODO 错误处理
  }

  private sendRTCEvent(msg: any){
    this.socket&&this.socket.emit(CLIENT_RTC_EVENT, JSON.stringify(msg));
  }
  private sendUserEvent(msg: any){
    this.socket&&this.socket.emit(CLIENT_USER_EVENT, JSON.stringify(msg));
}
}



