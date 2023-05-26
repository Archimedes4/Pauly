import React from 'react'
import styles from "./Cards.module.css"
import VideoContainerCard from '../../../UI/VideoContainerCard.tsx';
import PDFViewContainer from './PDFView.tsx';
import TextEditor from './TextEditor.tsx';
import SVG from './SVG/SVG.tsx';

export default function({components, zoomScale, onClick, bolded, italic, underlined, strikethrough, onPressed, onSetMousePosition, onIsShowingRightClick, selectedElementValue,
    isShowingRightClick, onIsChangingSize, onChangingSizeDirection, onIsUserTyping, isUserTyping, fontSize, fontStyle}:{
    components: CardElement[], 
    zoomScale: number, 
    onClick: (e: React.SyntheticEvent, Index: CardElement) => void,
    bolded: boolean,
    italic: boolean,
    underlined: boolean,
    strikethrough: boolean,
    onPressed: (item: boolean) => void,
    onSetMousePosition: (item: {x: number, y: number}) => void,
    onIsShowingRightClick: (item: boolean) => void,
    selectedElementValue: CardElement,
    isShowingRightClick: boolean,
    onIsChangingSize: (item: boolean) => void,
    onChangingSizeDirection: (item: string) => void,
    onIsUserTyping: (item: boolean) => void,
    isUserTyping: boolean,
    fontSize: string,
    fontStyle: string
    }) {
  return (
    <div>
        {components?.map((item: CardElement) => ( 
            <div style={{zIndex: item.CurrentZIndex, position: "absolute", cursor: "move", transform: `translate(${(item.Position.XPosition * (zoomScale/100))}px, ${(item.Position.YPosition * (zoomScale/100))}px)`, height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px"}}> 
            <div style={{ position: "absolute",
                    height: (item.Height  * (zoomScale/100)) + "px",
                    width: (item.Width  * (zoomScale/100)) + "px",}}>
            <button key={item.ElementIndex} style={{ position: "absolute", border: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "5px solid red":"none", backgroundColor: "transparent", margin:0, padding:0, cursor: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "select":"move", height: ((item.Height  * (zoomScale/100)) + 10) + "px", width: ((item.Width  * (zoomScale/100)) + 10) + "px"}}
            onClick={ (e) => {
                onClick(e, item)
            }}
            onMouseDown={(e) => {
                if (e.button == 0 && selectedElementValue?.ElementIndex === item.ElementIndex){
                    // setPressed(true)
                    onPressed(true)
                }
            }}
            onContextMenu={(e) => {
                e.preventDefault()
                onClick(e, item)
                onSetMousePosition({x: e.clientX, y: e.clientY})
                onIsShowingRightClick(!isShowingRightClick)   
            }}>
                <div style={
                {
                    opacity: item.Opacity/100
                }}>
                {(() => {
                        switch(item.ElementType) {
                        case "Text": return (
                        <>
                        <TextEditor onIsUserTyping={onIsUserTyping} zoomScale={zoomScale} isUserTyping={isUserTyping} item={item} bolded={bolded} italic={italic} strikethrough={strikethrough} underlined={underlined} fontSize={fontSize} fontStyle={fontStyle} selectedElementValue={selectedElementValue}/>  
                        </>)
                        case "Shape": return <div style={{ borderRadius: item.CornerRadius + "px",  height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px", backgroundColor: item.SelectedColor.toString(), padding: 0, margin: 0, border: "none"}}> </div>;
                        case "Image": return <div style={{ borderRadius: item.CornerRadius + "px",  height: (item.Height * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}><img src={item.Content} style={{height: item.Height + "px", width: item.Width + "px"}} draggable={false}/></div>;
                        case "Video": return (
                            <div style={{ borderRadius: item.CornerRadius + "px",  height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}>
                                <VideoContainerCard url={item.Content}/>
                            </div>)
                        case "PDF": return (
                            <div style={{overflow: "scroll", width: "100%", height: (item.Height  * (zoomScale/100)) + "px"}}>
                                <PDFViewContainer fileUrl={item.Content} />
                            </div>
                        )
                        case "SVG": return(
                            <div style={{display: "block"}}>
                                <SVG width={item.Width} height={item.Height} text={item.Content} onSetText={() => {}}/>
                            </div>
                        )
                        default: return <p style={{padding: 0, margin: 0}}> {item.Content} </p>
                        }
                    })()}
                </div>
            </button>
            { (selectedElementValue?.ElementIndex !== item.ElementIndex) ? null:
            <div>
                <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width  * (zoomScale/100)) + 5}px, -13px)`, cursor:"ne-resize"}}onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("ne")
                    }
                }}><span className={styles.dot} /></button> {/* Right Top */}
                <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width  * (zoomScale/100)) + 5}px, ${((item.Height * (zoomScale/100)) - 24)/2}px)`, cursor:"e-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("e")
                    }
                }}><span className={styles.dot} /></button>  {/* Right */} 
                <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width  * (zoomScale/100)) + 5}px, ${(item.Height * (zoomScale/100)) - 8}px)`, cursor:"se-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("se")
                    }
                }}><span className={styles.dot} /></button> {/* Right Bottem */}
                <button className={styles.dotButtonStyle} style={{transform: `translate(${((item.Width  * (zoomScale/100)) + 5)/2}px, ${((item.Height * (zoomScale/100))- 8)}px)`, cursor:"s-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("s")
                    }
                }}><span className={styles.dot} /></button> {/* Bottem */}
                <button className={styles.dotButtonStyle} style={{transform: `translate(0px, ${(item.Height  * (zoomScale/100)) - 8 }px)`, cursor:"sw-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("sw")
                    }
                }}><span className={styles.dot} /></button> {/* Left Bottem */}
                <button className={styles.dotButtonStyle} style={{transform: `translate(0px, ${((item.Height  * (zoomScale/100)) - 24)/2}px)`, cursor:"w-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("w")
                    }
                }}><span className={styles.dot} /></button> {/* Left */}
                <button className={styles.dotButtonStyle} style={{transform: `translate(0px, -13px)`, cursor:"nw-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("nw")
                    }
                }}><span className={styles.dot} /></button> {/* Left Top */}
                <button className={styles.dotButtonStyle} style={{transform: `translate(${((item.Width  * (zoomScale/100)) + 5)/2}px, -13px)`, cursor:"n-resize"}} onMouseDown={() => {
                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                        onIsChangingSize(true)
                        onChangingSizeDirection("n")
                    }
                }}><span className={styles.dot} /></button> {/* Top */}
            </div>
            }
            </div>
            </div>
        ))}
    </div>
  )
}
