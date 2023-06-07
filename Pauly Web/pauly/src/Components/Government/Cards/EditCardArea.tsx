import React, { useImperativeHandle, useRef } from 'react'
import styles from "./Cards.module.css"
import VideoContainerCard from '../../../UI/VideoContainerCard.tsx';
import PDFViewContainer from './PDFView.tsx';
import TextEditor from './LexicalFunctions/TinyMCETextEditor.tsx';
import SVG from './SVG.tsx';
import Textview from './LexicalFunctions/Textview.tsx';

export default React.forwardRef(({components, onSetComponents, zoomScale, onClick, bolded, italic, underlined, strikethrough, onPressed, onSetMousePosition, onIsShowingRightClick, selectedElementValue, isShowingRightClick, onIsChangingSize, onChangingSizeDirection, onIsUserTyping, isUserTyping, fontSize, fontStyle}:{
    components: CardElement[], 
    onSetComponents: (item: CardElement[]) => void,
    zoomScale: number, 
    onClick: (e: React.SyntheticEvent, Index: CardElement) => void,
    bolded: boolean,
    onSetIsBolded: (item: boolean) => void,
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
    }, ref) =>  {
    const textEditorRef = useRef(null)
    useImperativeHandle(ref, () => {
        return {
            bold () {
                textEditorRef.current?.bold()
            },
            italic () {
                textEditorRef.current?.italic()
            },
            underline (){
                textEditorRef.current?.underline()
            },
            strikethrough () {
                textEditorRef.current?.strikethrough()
            }
        }
    }, [])
  return (
    <div>
        {components?.map((item: CardElement) => ( 
            <div style={{zIndex: item.CurrentZIndex, position: "absolute", cursor: "move", transform: `translate(${(item.Position.XPosition * (zoomScale/100))}px, ${(item.Position.YPosition * (zoomScale/100))}px)`, height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px"}}> 
            <div style={{ position: "absolute",
                    height: (item.Height  * (zoomScale/100)) + "px",
                    width: (item.Width  * (zoomScale/100)) + "px",}}>
            <div key={item.ElementIndex} style={{ position: "absolute", border: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "5px solid red":"none", backgroundColor: "transparent", margin:0, padding:0, cursor: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "select":"move", height: ((item.Height  * (zoomScale/100)) + 10) + "px", width: ((item.Width  * (zoomScale/100)) + 10) + "px"}}
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
                            <div style={{width: item.Width, height: item.Height}}>
                                { (selectedElementValue?.ElementUUID === item.ElementUUID) ?
                                    <TextEditor text={item.Content} onSetText={(value: string) => {
                                        if (value !== undefined && selectedElementValue){
                                            const NewComponents = [...components]
                                            const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                                            NewComponents[SelectedIndex]["Content"] = value
                                            onSetComponents(NewComponents)
                                        }
                                    }}ref={textEditorRef} height={item.Height} width={item.Width}/>:<div> PlaceHolder </div>
                                } {/* onIsUserTyping={onIsUserTyping} isUserTyping={isUserTyping} item={item} bolded={bolded} italic={italic} strikethrough={strikethrough} underlined={underlined} fontSize={fontSize} fontStyle={fontStyle} selectedElementValue={selectedElementValue}*/}  
                            </div>
                        )
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
                        case "SVG": return <SVG read={true} content={item.Content} width={item.Width} height={item.Height} />
                        default: return <p style={{padding: 0, margin: 0}}> {item.Content} </p>
                        }
                    })()}
                </div>
            </div>
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
})
