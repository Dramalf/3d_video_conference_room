import React from 'react'
import './index.css'
export default function ToggleBtn(props:any) {
    return (
        <div className="button r" id="button-9">
        <input type="checkbox" className="checkbox" onClick={(e)=>{
            //@ts-ignore
            let checked=e.target.checked;
            props.onToggle(checked)
        }}/>
        <div className="knobs" data-l={props.l} data-r={props.r}>
          <span></span>
        </div>
        <div className="layer"></div>
      </div>
    )
}
