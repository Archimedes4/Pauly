import React, { useState, useEffect } from 'react'
import { Button, Card, Stack, Container, Row, Col } from 'react-bootstrap'
import styles from "./Cards.module.css"
import EditCardArea from './EditCardArea'
import Toolbar from './Toolbar'
import ToolbarBottom from './ToolbarBottom'

type FontType = {
    fontName: string
    fontVarients: string[]
    fontSubsets: string[]
    UUID: string
}

function CardAddNewCard({isShowingPaulyLibaray, onSetIsShowingPaulyLibrary, onSetIsShowingCardsMenu}:
    {
        isShowingPaulyLibaray: boolean,
        onSetIsShowingPaulyLibrary: (item: boolean) => void,
        onSetIsShowingCardsMenu: (item: boolean) => void,

    }){
    const [components, setComponents] = useState<CardElement[]>([])
    const [scrollDir, setScrollDir] = useState("scrolling down");
    const [pressed, setPressed] = React.useState(false)
    const [selectedElementValue, setSelectedElement] = React.useState<CardElement>()
    const [isShowingRightClick, setIsShowingRightClick] = React.useState(false)
    const [MousePosition, setMousePosition] = React.useState({x: 0, y:0})
    const [isChangeingSize, setIsChangingSize] = React.useState(false)
    const [chaningSizeDirection, setChangingSizeDirection] = React.useState<String>(null)
    const [isUserTyping, setIsUserTypeing] = React.useState(false)
    const [areaHeight, setAreaHeight] = useState(85)
    const [areaWidth, setAreaWidth] = useState(80)
    const [aspectHeight, setAspectHeight] = useState(10)
    const [aspectWidth, setAspectWidth] = useState(10)
    const [width, setWidth] = useState(window.innerWidth * 0.9);//Device Width
    const [height, setHeight] = useState(window.innerHeight * 0.7);//Device height
    const [bolded, setBolded] = useState<boolean>(false)
    const [underlined, setUnderlined] = useState<boolean>(false)
    const [italic, setItalic] = useState<boolean>(false)
    const [strikethrough, setStrikethrough] = useState<boolean>(false)
    const [fontSize, setFontSize] = useState<string>("12px")
    const [fontStyle, setFontStyle] = useState<string>("Times New Roman")
    const [fontList, setFontList] = useState<FontType []>([])
    const [selectedFont, setSelectedFont] = useState<FontType>(null)
    const avaliableFontSizes: string[] = ["8px", "12px", "14px", "16px", "20px", "24px"]
    const [isShowingBindPage, setIsShowingBindPage] = useState<boolean>(false)
    const [currentUserInfo, setCurrentUserInfo] = useState<UserType>(null)
    const [showingFontSelectedMenu, setShowingFontSelectionMenu] = useState<boolean>(false)
    const [zoomScale, setZoomScale] = useState("100")
    const [isInDotsMode, setIsInDotsMode] = useState(false)
    const [isInDrawMode, setIsInDrawMode] = useState(false)
    const [dotsText, setDotsText] = useState("")
    const [selectedTextColor, setSelectedTextColor] = useState("")

    const handleOnClick = (e: React.SyntheticEvent, Index: CardElement) => {
        e.preventDefault();
        if (selectedElementValue?.ElementIndex !== Index.ElementIndex){
            setSelectedElement(Index)
        }
    };

    const handler = (event: React.KeyboardEvent) => {
        if (event.key === 'Backspace' && !isUserTyping) {
            const NewComponents = [...components]
            const removeIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
            setSelectedElement(null)
            const save = NewComponents[0] 
            NewComponents[0] = NewComponents[removeIndex]
            NewComponents[removeIndex] = save
            NewComponents.shift()
            setComponents(NewComponents)
        }
    };

    function onMouseMoveUpdateComponents(NewComponents: any[], SelectedIndex: number, event: React.MouseEvent) {
        if (pressed){
          if (selectedElementValue != undefined) {
              NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
              NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
          }
        } else {
          if (isChangeingSize) {
              if (selectedElementValue != undefined) {
                  if (chaningSizeDirection === "n"){
                      NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                      NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
                  }
                  else if (chaningSizeDirection === "s"){
                      NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
                  }
                  else if (chaningSizeDirection === "e"){
                      NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementX
                  }
                  else if (chaningSizeDirection === "w"){
                      NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementX
                      NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
                  }
                  else if (chaningSizeDirection === "nw" ){
                      NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
                      NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementY
                      NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
                      NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                  }
                  else if (chaningSizeDirection === "ne"){
                      NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
                      NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementY
                      NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                  }
                  else if (chaningSizeDirection === "sw"){
                      NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
                      NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementY
                      NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
                  }
                  else if (chaningSizeDirection === "se"){
                      NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
                      NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementY
                  }
              }
          }
        }
        setComponents(NewComponents)
    }

    // Update the current position if mouse is down
    const onMouseMove = (event: React.MouseEvent) => {
        const NewComponents = [...components]
        const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
        onMouseMoveUpdateComponents(NewComponents, SelectedIndex, event)
    }

    function addComponent(e: React.SyntheticEvent, newValue:CardElement) { 
        e.preventDefault()
        setComponents([...components, newValue])

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

    useEffect(() => {
        CalculateAreaPlaneSize()
    }, [zoomScale, height, width, selectedElementValue]);

    function CalculateAreaPlaneSize() {
        const zoomScaleF = parseFloat(zoomScale)
        var elementWidth = width * 0.8
        const elementHeight = height * 0.85
        if (aspectWidth >= aspectHeight){
          const newHeight = (elementWidth/aspectWidth) * aspectHeight
          console.log("new height", newHeight)
          if (newHeight > elementHeight){
            setAreaHeight((elementHeight) * (zoomScaleF/100))
            setAreaWidth(((elementWidth/aspectWidth) * aspectHeight) * (zoomScaleF/100))
          } else {
            setAreaHeight(newHeight * (zoomScaleF/100))
            setAreaWidth(elementWidth * (zoomScaleF/100))
          }
        } else {
          const newWidth = (elementHeight/aspectHeight) * aspectWidth
          if (newWidth > elementHeight){
            setAreaWidth((elementHeight) * (zoomScaleF/100))
            setAreaHeight(((elementHeight/aspectHeight) * aspectWidth) * (zoomScaleF/100))
          } else {
            setAreaWidth(newWidth * (zoomScaleF/100))
            setAreaHeight(elementHeight * (zoomScaleF/100))
          }
        }
    }
    

    return (
        <Card>
                <Row>
                    <Col md={2} style={{margin: 0, padding: 0, paddingLeft: "0.8%", backgroundColor: '#444444'}} className="d-none d-md-block">
                        <Toolbar onSaveDrawMode={(e) => {
                            var myImage = "text"
                            addComponent(e,  {ElementType: "Image", Content: myImage, Position: {XPosition: 0, YPosition: 0}, Width: 500, Height: 500, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                        }} selectedTextColor={selectedTextColor} onSetSelectedTextColor={setSelectedTextColor} onSetDotsText={setDotsText} dotsText={dotsText} onAddComponent={addComponent} onSetIsInDotsMode={setIsInDotsMode} isInDotsMode={isInDotsMode} isInDrawMode={isInDrawMode} selectedElementValue={selectedElementValue} components={components} onSetComponents={setComponents} onSetSelectedElement={setSelectedElement} onSetBolded={setBolded} onSetItalic={setItalic} onSetUnderlined={setUnderlined} onSetStrikethrough={setStrikethrough} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} isShowingBindPage={isShowingBindPage} onSetIsShowingBindPage={setIsShowingBindPage} onSetFontSize={setFontSize} onSetSelectedFont={setSelectedFont} fontSize={fontSize} fontStyle={fontStyle} />
                    </Col>
                    <Col style={{padding: 0}}>
                        {/* Continer */}
                        <div className={styles.CardContainterCardCSS}
                            onKeyDown={handler}
                            onMouseUp={ (e) => {
                            if (e.button == 0){
                                if (pressed){
                                    setPressed(false)
                                    // setIsShowingRightClick(false)
                                } else {
                                    if (isChangeingSize){
                                    setIsChangingSize(false)
                                    } else {
                                    setPressed(false)
                                    setSelectedElement(null)
                                    }
                                }
                            }
                            }}
                        >
                            <div style={{display: (parseFloat(zoomScale) >= 100) ? "block":"flex", justifyContent: "center", alignItems: "center", overflow: "scroll", height: (height * 0.8), width: (width * 0.8)}}>
                                <div style={ (parseFloat(zoomScale) >= 100) ? 
                                {
                                    width: areaWidth + "px",
                                    height: areaHeight + "px",
                                    display: "block",
                                    overflow: "hidden",
                                    margin: "auto",
                                    padding: 0,
                                    transform: "scale(" + (parseFloat(zoomScale)/100) +")",
                                    transformOrigin: "-" + (parseFloat(zoomScale)/100) + "px" + " "+ "0" +"px"
                                }:{
                                    width: areaWidth + "px",
                                    height: areaHeight + "px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: "auto",
                                    padding: 0,
                                    overflow: "scroll",
                                    transform: "scale(" + (parseFloat(zoomScale)/100) +")",
                                }}
                                >  
                                {/* Area Plane */}
                                <div 
                                    style={{
                                    transformOrigin: "top left",
                                    backgroundColor: "gray",
                                    height: areaHeight + "px",
                                    width: areaWidth + "px",
                                    border: "2px solid black",
                                    display: 'flex'
                                    }}
                                    onMouseMove={ onMouseMove }
                                >
                                    <EditCardArea components={components} onSetComponents={setComponents} zoomScale={parseFloat(zoomScale)} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle} onSetIsBolded={() => {}}></EditCardArea>
                                {/* End Of Components */}
                                </div>
                            </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <ToolbarBottom zoomScale={zoomScale} onSetZoomScale={setZoomScale} onSetIsShowingPaulyLibrary={onSetIsShowingPaulyLibrary} onSetIsShowingCardsMenu={onSetIsShowingCardsMenu}
                    isShowingPaulyLibaray={isShowingPaulyLibaray} onAddComponent={addComponent} components={components} onSetInDotsMode={() => {}} onSetInDrawMode={() => {}} />
                </Row>
        </Card>
    )
}

export default function CardAddMenu({onSetIsShowingCardsMenu, onSetIsShowingPaulyLibrary, isShowingPaulyLibrary}:{
    onSetIsShowingCardsMenu: (item: boolean) => void,
    onSetIsShowingPaulyLibrary: (item: boolean) => void,
    isShowingPaulyLibrary: boolean
}) {
    const [isShowingCardAddMenu, setIsShowingCardAddMenu] = useState<boolean>(false)
    return (
        <div className={styles.ImageLibraryView}>
            <Card className={styles.ImageLibraryViewCard}>
            <Card.Title>
                <Stack direction='horizontal'>
                <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Cards</h1>
                { isShowingCardAddMenu ?  <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {setIsShowingCardAddMenu(false)}}>Back</Button>:
                    <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {onSetIsShowingCardsMenu(false)}}>Close</Button>
                }
                </Stack>
            </Card.Title>
            <Card.Body>
                { isShowingCardAddMenu ? 
                <div>
                    <CardAddNewCard isShowingPaulyLibaray={isShowingPaulyLibrary} onSetIsShowingCardsMenu={setIsShowingCardAddMenu} onSetIsShowingPaulyLibrary={onSetIsShowingPaulyLibrary}/>
                </div>:
                <div>
                    <Card>
                        <p>Cards</p>
                    </Card>
                    <Button onClick={() => {setIsShowingCardAddMenu(true)}}>
                        Add New
                    </Button>
                </div>
                }
            </Card.Body>
            </Card>
        </div>
    )
}
