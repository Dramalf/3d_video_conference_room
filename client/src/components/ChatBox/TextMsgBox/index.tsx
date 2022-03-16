import React from 'react'
import './index.css'
export default function TextMsgBox(props:any) {
    const {
        message,
        userName
    }=props.msgInfo
  return (
    <div className='msg-wrapper'>
        <div className='message my-message'>
        {message}
        </div>
    </div>
  )
}
