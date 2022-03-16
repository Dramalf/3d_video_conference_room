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

    const [msg_record,update_msg_reord]=useState<any>([])

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
    function msgBubbles(userName:String,message:String,isSelf:Boolean){
            const msgDOM=document.createElement('p')
            msgDOM.classList.add('text-msg-box')
            msgDOM.innerText=`${userName}：${message}`
            msgDOM.style.color=isSelf?"blue":"black"
            return msgDOM

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
            }
            update_msg_reord([...msg_record,newMsgInfo]);
             (msgBox as HTMLElement).appendChild(msgBubbles(userName, message, false));
             (msgBox as HTMLElement).scrollTop=(msgBox as HTMLElement).scrollHeight
        }
        socket.on(SERVER_USER_EVENT,(msg)=>{
            const {type,payload}=msg
            if(type===SERVER_USER_EVENT_BROADCAST_MESSAGE){
                receiveNewMsg(payload)
            }
        })
    }, [])
    useEffect(() => {
        const msgBox: HTMLElement | null = document.querySelector(".chat-record-panel")
        const inputText: HTMLTextAreaElement | null = document.querySelector(".input-panel textarea")
        const sendBtn: HTMLElement | null = document.querySelector(".send-msg-btn")
        sendBtn && sendBtn.addEventListener('click', sendTextMsg)
        function sendTextMsg() {
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
                }
                update_msg_reord([...msg_record,newMsgInfo]);
                // (msgBox as HTMLElement).appendChild(textBox());

                // (msgBox as HTMLElement).appendChild(msgBubbles(props.userName, textMsg, true) as unknown as Node);
                (msgBox as HTMLElement).scrollTop=(msgBox as HTMLElement).scrollHeight;
                (inputText as HTMLTextAreaElement).value = ""
            }
        }
        return () => {
            sendBtn && sendBtn.removeEventListener('click', sendTextMsg)
        }
    }, [])


    return (
        <div className="chat-box-wrapper">
            <div className="chat-record-panel">
                <h2>历史聊天记录</h2>
                {
                    msg_record&&msg_record.map((m: any)=>{
                        return <TextMsgBox key={m.timeStamp} msgInfo={m}/>
                    })
                }
            </div>
            <div className="send-msg-part">
                <div className="input-panel">
                    <textarea name="comment" rows={4} cols={15} maxLength={140} required>
                    </textarea>
                </div>
                <div className="send-msg-btn">
                    <div>发送</div>
                </div>
            </div>
        </div>
    )
}
