import React, { useEffect,useState } from 'react'
import socket from '../../modules/Socket'
import TextMsgBox from './TextMsgBox'
import "./index.css"
import {
    CLIENT_RTC_EVENT,
    SERVER_RTC_EVENT,

    CLIENT_USER_EVENT,
    SERVER_USER_EVENT,
    CLIENT_USER_EVENT_LOGIN,
    SERVER_USER_EVENT_UPDATE_USERS,
    CLIENT_USER_EVENT_SEND_MESSAGE,
    SERVER_USER_EVENT_BROADCAST_MESSAGE,
    SIGNALING_OFFER,
    SIGNALING_ANSWER,
    SIGNALING_CANDIDATE,
} from '../../modules/constant'
interface ChatBoxProps {
    userName: String
}
export default function ChatBox(props: ChatBoxProps) {

    const [msg_history,update_msg_history]=useState<any>([])

    function sendUserEvent(msg: any) {
        socket.emit(CLIENT_USER_EVENT, JSON.stringify(msg));
    }

    interface UserMsg {
        userName: String,
        message: String,
        roomID: any
    }
    function sendMsgBySocket(payload: UserMsg) {
        sendUserEvent({
            type: CLIENT_USER_EVENT_SEND_MESSAGE,
            payload
        });
    }


    useEffect(() => {
        const msgBox: HTMLElement | null = document.querySelector(".chat-record-panel")
        function receiveNewMsg(payload:UserMsg) {
            const {userName,message}=payload;
            const newMsgInfo={
                userName,
                message,
                isSelf:false,
                timeStamp:Date.now()
            };
            update_msg_history([...msg_history,newMsgInfo]);
             //(msgBox as HTMLElement).appendChild(msgBubbles(userName, message, false));
             (msgBox as HTMLElement).scrollTop=(msgBox as HTMLElement).scrollHeight
        }
        socket.on(SERVER_USER_EVENT,(msg)=>{
            const {type,payload}=msg
            if(type===SERVER_USER_EVENT_BROADCAST_MESSAGE){
                receiveNewMsg(payload)
                console.log('revieve new msg')
            }
        })
    })
    function sendTextMsg() {
        const msgBox: HTMLElement | null = document.querySelector(".chat-record-panel")
        const inputText: HTMLTextAreaElement | null = document.querySelector(".input-panel textarea")
        const textMsg = (inputText as HTMLTextAreaElement).value
        let roomId = 100

        if (textMsg) {
            //socket.emit("sendNewMsg", textMsg, roomId);
            const payload = {
                userName: props.userName,
                message: textMsg,
                roomID: roomId
            }
            sendMsgBySocket(payload);
            const newMsgInfo={
                userName:props.userName,
                message:textMsg,
                isSelf:true,
                timeStamp:Date.now()
            };
         
            update_msg_history([...msg_history,newMsgInfo]);
            // (msgBox as HTMLElement).appendChild(textBox());
          
            // (msgBox as HTMLElement).appendChild(msgBubbles(props.userName, textMsg, true) as unknown as Node);
            (msgBox as HTMLElement).scrollTop=(msgBox as HTMLElement).scrollHeight;
            (inputText as HTMLTextAreaElement).value = ""
        }
    }

    return (
        <div className="chat-box-wrapper">
            <div className="chat-record-panel">
                <h4>聊天</h4>
                {
                    msg_history&&msg_history.map((m: any)=>{
                        return <TextMsgBox key={m.message} msgInfo={m}/>
                    })
                }
            </div>
            <div className="send-msg-part">
                <div className="input-panel">
                    <textarea name="comment" contentEditable={true} data-text="输入内容...">
                    </textarea>
                </div>
                <div className="send-msg-btn" onClick={sendTextMsg}>
                <svg  className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2268" width="200" height="200"><path d="M392.021333 925.013333a34.133333 34.133333 0 0 1-34.133333-34.133333V579.242667c0-10.24 4.608-19.968 12.629333-26.453334l276.48-224.085333a34.0992 34.0992 0 0 1 43.008 52.906667L426.154667 595.456v192.853333l82.944-110.592c10.069333-13.482667 28.672-17.578667 43.52-9.557333l137.557333 73.728L853.333333 156.16c3.242667-11.434667-3.413333-18.602667-6.485333-21.162667-3.072-2.56-11.093333-7.850667-21.845333-2.901333L206.336 422.4l80.213333 46.08c16.384 9.386667 22.016 30.208 12.629334 46.592s-30.208 22.016-46.592 12.629333l-137.045334-78.677333a33.979733 33.979733 0 0 1-17.066666-31.061333c0.512-12.8 8.021333-24.064 19.626666-29.525334L795.989333 70.314667c31.744-14.848 68.096-10.069333 94.890667 12.629333a87.790933 87.790933 0 0 1 28.16 91.477333L744.277333 801.28a34.082133 34.082133 0 0 1-48.981333 20.821333L546.133333 742.058667l-126.805333 169.301333c-6.656 8.704-16.896 13.653333-27.306667 13.653333z" p-id="2269" fill="#e6e6e6"></path></svg>                </div>
               
            </div>
        </div>
    )
}
