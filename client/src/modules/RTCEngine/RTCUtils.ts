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
export const sendUserEvent = (msg: any) => {
    socket.emit(CLIENT_USER_EVENT, JSON.stringify(msg));
}
export const sendRTCEvent=(msg: any)=> {
    socket.emit(CLIENT_RTC_EVENT, JSON.stringify(msg));
  }

