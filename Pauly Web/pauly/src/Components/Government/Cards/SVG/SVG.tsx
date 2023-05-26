import React, { useRef, useState } from 'react'

export default function SVG({text, onSetText, width, height}:{text: string, onSetText: (item: string) => void, width: number, height: number}) {
    // const [text, setText] = useState<string>("")
    const divRef = useRef(null)
    function FindOffset() {
        console.log("Offset", divRef.current?.offsetLeft)
    }
    return (
        <div onMouseDown={(e) => {
            if (e.button === 0){
                const boundingRect = divRef.current?.getBoundingClientRect();
                FindOffset()
                if (text === ""){
                    onSetText(text + (e.clientX - boundingRect.left) + "," + (e.clientY - boundingRect.top))
                } else {
                    onSetText(text + " " + (e.clientX - boundingRect.left)+ "," + (e.clientY - boundingRect.top))
                }
                console.log("Text", text + " " + (e.clientX - divRef.current?.offsetLeft)+ "," + (e.clientY - divRef.current?.offsetTop))
            }            
        }} style={{height: height, width: width}} ref={divRef}>
            <svg height={height} width={width}>
                <polygon points={text} style={{fill: "lime", stroke: "purple", strokeWidth:1}} />
            </svg>
        </div>
    )
}
