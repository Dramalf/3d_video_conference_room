import React from 'react'
import './index.css'
export default function TextMsgBox(props:any) {
    const {
        message,
        userName,
        isSelf,
        timeStamp
    }=props.msgInfo
  return (
    <div className='msg-wrapper'>
        <div className={`message ${isSelf?'my-message':'other-message'}`} data-time={ new Date(timeStamp).toTimeString().substr(0, 8)}>
        {message}
        </div>
    </div>
  )
}
