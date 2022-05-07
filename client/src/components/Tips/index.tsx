import React from 'react'
import './index.css'
function Tips(props:any) {
    return (
        <div className='tips-wrapper'>
            <div className='tips-box'>
                <h4>提示</h4>
                <div
                    className='info-box'> <div>会议期间会使用到您的摄像头或麦克风</div>
                    <div>观众可以选择VR模式旁听会议</div>
                    <div>声控和手势识别功能可根据个人需要和设备性能选择开启</div>
                </div>
                <div className='tips-enter-btn'>
                    进入会议
                </div>
            </div>
        </div>
    )
}

export default Tips