import React, {useEffect, useRef, useState} from 'react'
import styles from "./Cards.module.css"

type EditPoint = {
    x: number,
    y: number,
    UUID: string,
    index: number
}

const SVG = React.forwardRef(({content, width, height, onClickContent, read}:{content: string, width: number, height: number, onClickContent?: (item: string) => void, read: boolean}, Ref) => {

    const divRef = useRef(null)
    const [dotsContent, setDotsContent] = useState("")
    const [currentText, setCurrentText] = useState("")
    const [editablePoints, setEditablePoints] = useState<EditPoint[]>([])
    const [selectedDot, setSelectedDot] = useState<EditPoint | null>(null)
    
    useEffect(() => {
        if (selectedDot === null && dotsContent !== ""){
            const value = dotsContent.split(" ")
            var output = ""
            var editOutput: EditPoint[] = []
            for(var index = 0; index < value.length; index++){
                const values = value[index].split(",")
                const XValue = parseFloat(values[0])
                const YValue = parseFloat(values[1])
                const XPosition = XValue * width
                const YPosition = YValue * height
                if (index === 0){
                    output = XPosition + "," + YPosition
                } else {
                    output += " " + XPosition + "," + YPosition
                }
                editOutput.push({x: XPosition, y: YPosition, UUID: create_UUID(), index: index})
            }
            setEditablePoints(editOutput)
            setCurrentText(output)
        }
    }, [dotsContent])   

    function updatePosition(points: EditPoint[]) {
        if (selectedDot !== null){
            const SelectedIndex = points.findIndex((element: EditPoint) => element.UUID === selectedDot.UUID)
            if (SelectedIndex !== -1) {
                var output = ""
                var textOutput = "'"
                for(var index = 0; index < points.length; index++){
                    if (index === 0){
                        output = points[index].x/width + "," + points[index].y/height
                        textOutput = points[index].x + "," + points[index].y
                    } else {
                        output += " " + points[index].x/width + "," + points[index].y/height
                        textOutput += " " + points[index].x + "," + points[index].y
                    }
                }
                setDotsContent(output)
                setCurrentText(textOutput)
            }
        }
    }

    function create_UUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    return (
        <div onClick={(e) => {
            if (!read && selectedDot === null){
                const XValue = (e.clientX - divRef.current.getBoundingClientRect().left)
                const YValue = (e.clientY - divRef.current.getBoundingClientRect().top)
                const XPosition = XValue/width
                const YPosition = YValue/height
                if (dotsContent === "") {
                    setDotsContent(XPosition + "," + YPosition)
                } else {
                    setDotsContent(dotsContent + " " + XPosition + "," + YPosition)
                }
            }
        }} onMouseMove={(e) => {
            if (selectedDot != null){
                const SelectedIndex = editablePoints.findIndex((element: EditPoint) => element.UUID === selectedDot.UUID)
                if (SelectedIndex != -1){
                    editablePoints[SelectedIndex].x = e.clientX - divRef.current.getBoundingClientRect().left
                    editablePoints[SelectedIndex].y = e.clientY - divRef.current.getBoundingClientRect().top
                    updatePosition(editablePoints)
                }
            }
        }} onKeyDown={(e) => {
            console.log(e.key)
            console.log(selectedDot)
            if (e.key === 'Backspace' && selectedDot !== null) {
                console.log("here")
                console.log("before", editablePoints)
                const resulteditablePoints = editablePoints
                const zero = resulteditablePoints[0]
                resulteditablePoints[0] = resulteditablePoints[selectedDot.index]
                resulteditablePoints[selectedDot.index] = zero
                console.log(resulteditablePoints)
                resulteditablePoints.shift()
                for (var index = 0; index < resulteditablePoints.length; index++){
                    resulteditablePoints[index].index = index
                }
                setEditablePoints(resulteditablePoints)
                console.log("Result", resulteditablePoints)
                var output = ""
                var textOutput = ""
                for(var index = 0; index < resulteditablePoints.length; index++){
                    console.log(resulteditablePoints[index])
                    if (index === 0){
                        output = resulteditablePoints[index].x/width + "," + resulteditablePoints[index].y/height
                        textOutput = resulteditablePoints[index].x + "," + resulteditablePoints[index].y
                    } else {
                        output += " " + resulteditablePoints[index].x/width + "," + resulteditablePoints[index].y/height
                        textOutput += " " + resulteditablePoints[index].x + "," + resulteditablePoints[index].y
                    }
                }
                setDotsContent(output)
                setCurrentText(textOutput)
                setSelectedDot(null)
            }
        }}
        ref={divRef} style={{border: "5px soild red"}}>
            {read ?
                <svg width={width} height={height}>
                    <polygon points={currentText} style={{fill: 'lime', stroke: 'purple', strokeWidth: 1}} />
                </svg>:
                <div style={{display: "grid"}}>
                    <svg width={width} height={height} style={{zIndex: 1, gridRow: 1, gridColumn: 1}}>
                        <polygon points={currentText} style={{fill: 'lime', stroke: 'purple', strokeWidth: 1}} />
                    </svg>
                    {editablePoints.map((point: EditPoint) => (
                        <div onClick={() => {
                            if (selectedDot == null){
                                console.log("Selected")
                                console.log("Point", point)
                                setSelectedDot(point)
                            } else {
                                console.log("UNNNNNNSelected")
                                // setSelectedDot(null) 
                                setSelectedDot(null)
                            }
                        }} className={styles.dot} style={{transform: `translate(${point.x}px, ${point.y}px)`, zIndex: 2, cursor: "move",  gridRow: 1, gridColumn: 1}}>
                        </div>
                    ))
                    }
                </div>
            }
        </div>
    )
})

export default SVG