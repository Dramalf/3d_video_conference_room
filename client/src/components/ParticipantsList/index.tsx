import React from 'react'
import './index.css'
interface Iprops {
    participantsList:Array<String>
}
export default function ParticipantsList(props:Iprops) {
    return (
        <div className='user-list-wrapper'>
            <h4>与会列表</h4>
            <div className='user-list-box'>
            {props.participantsList.map(participants=>{
                return <div key={participants.toString()} data-name={participants}>{participants}</div>
            })}
            </div>
          
        </div>
    )
}
