import React from 'react'
interface Iprops {
    participantsList:Array<String>
}
export default function ParticipantsList(props:Iprops) {
    return (
        <div>
            {props.participantsList.map(participants=>{
                return <div key={participants.toString()} data-name={participants}>{participants}</div>
            })}
        </div>
    )
}
