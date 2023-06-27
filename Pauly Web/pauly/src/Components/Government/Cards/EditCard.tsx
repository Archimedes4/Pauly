import React, { useState, useRef, useEffect } from 'react'
import { Link, Navigate } from "react-router-dom"
import { Container, Row, Col, Button, Card, Form, Stack, Dropdown, InputGroup, ListGroup } from 'react-bootstrap';
import EditCardArea from './EditCardArea.tsx';
import { useCardContext } from "./Cards"
import styles from "./Cards.module.css"
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import { FcLeft, FcSettings, FcIphone } from "react-icons/fc"
import { getStorage, ref, uploadBytesResumable, UploadTaskSnapshot, getDownloadURL } from 'firebase/storage';
import { doc, collection, getDoc, getDocs, getFirestore, addDoc, Timestamp, serverTimestamp, FieldValue, updateDoc, where, query, DocumentData, startAt, limit, startAfter, setDoc, deleteDoc, and } from "firebase/firestore";
import { UseAuth } from '../../../Contexts/AuthContext';
import UploadMicrosoftFile from './uploadMicrosoftFile.tsx';
import BindMenu from './BindMenu.tsx';
import PaulyLibrary from './paulyLibrary.tsx';
import CardAddMenu from './CardAddMenu.tsx';
import Toolbar from './Toolbar.tsx';
import ToolbarBottom from './ToolbarBottom.tsx';
import Canvas from "./Canvas/Canvas"
import SVG from './SVG.tsx';
import {IoIosArrowBack} from "react-icons/io"
import { CanvasModeType } from './Canvas/Canvas';
import { addNewOnFierbase, updateOnFierbase, deleteOnFirebase, loadFromFirebase } from '../../../Functions/CardFirebaseFuncitons.tsx';
import create_UUID from "../../../Functions/CreateUUID"
import PageSettings from './PageSettings.tsx';

declare global{
  type CardElement = {
    ElementType: string
    Content: string
    Position: {
      XPosition: number
      YPosition: number
    }
    Width: number
    Height: number
    CurrentZIndex: number
    ElementIndex: number
    Opacity: number
    CornerRadius: number
    SelectedColor: string
    SelectedFont: string
    ElementUUID: string
  }
  type ClassType = {
    courseName: string,
    dayA: number,
    dayB: number,
    dayC: number,
    dayD: number,
    noClass: string[],
    schoolYear: number,
    section: number,
    semester: number,
    teacher?: UserType,
    teacherArray?: UserType[],
    team?: TeamsGroupType,
    grade: number
  }
  type deviceModeType = {
    aspectRatio: {
      Width: number
      Height: number
    }
    name: string
    id: string
    logo: "computer" | "phone" | "tablet"
    order: number
    components?: CardElement[]
  }
}

interface SelectedFont {
  family: string;
  category: string;
}

type FontType = {
  fontName: string
  fontVarients: string[]
  fontSubsets: string[]
  UUID: string
}

type FontTypeCSS = {
  UUID: string
}


export default function EditCard() {
  const outerDivRef = useRef(null)
  const { selectedPage, zoomScale, setZoomScale, components, setComponents } = useCardContext()
  const [isShowingSettings, setIsShowingSettings] = useState(false)
  const [isNavigateToDestinations, setIsNavigateToDestinations] = useState(false)
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
  const [aspectHeight, setAspectHeight] = useState(20)
  const [aspectWidth, setAspectWidth] = useState(10)
  const [width, setWidth] = useState(window.innerWidth);//Device Width
  const [height, setHeight] = useState(window.innerHeight);//Device height
  const [avaliableDeviceModes, setAvaliableDeviceModes] = useState<deviceModeType[]>(null)
  const [selectedDeviceMode, setSelectedDeviceMode] = useState<deviceModeType>(null)
  const [isShowingBindPage, setIsShowingBindPage] = useState<boolean>(false)
  const [showingFontSelectedMenu, setShowingFontSelectionMenu] = useState<boolean>(false)
  const { app, db, currentUser, currentUserMicrosoftAccessToken } = UseAuth()
  const [isShowingPaulyLibaray, setIsShowingPaulyLibrary] = useState(false)
  const editorRef = useRef(null)
  const [lastMousePosition, setLastMousePosition] = useState({x: 0, y:0})

  //TextSettings
  const [bolded, setBolded] = useState<boolean>(false)
  const [underlined, setUnderlined] = useState<boolean>(false)
  const [italic, setItalic] = useState<boolean>(false)
  const [strikethrough, setStrikethrough] = useState<boolean>(false)
  const [selectedFont, setSelectedFont] = useState<FontType>(null)
  const [fontSize, setFontSize] = useState<string>("12px")
  const [fontStyle, setFontStyle] = useState<string>("Times New Roman")
  const [selectedTextColor, setSelectedTextColor] = useState("rgba(0, 0, 0, 1)")
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("rgba(255, 165, 0, 0)")


  //Card Menu
  const [isShowingCardsMenu, setIsShowingCardsMenu] = useState<boolean>(false)

  //Shapes Menu
  const [isInDotsMode, setIsInDotsMode] = useState(false)
  const [isInDrawMode, setIsInDrawMode] = useState(false)
  const [dotsText, setDotsText] = useState("")
  const [selectedBrushColor, setSelectedBrushColor] = useState("")
  const canvasRef = useRef(null)
  const svgRef = useRef(null)
  const [selectedCanvasMode, setSelectedCanvasMode] = useState<CanvasModeType>(CanvasModeType.Draw)

  useEffect(() => {
    if (selectedDeviceMode !== null){
      setSelectedElement(undefined)
      setAspectHeight(selectedDeviceMode.aspectRatio.Height)
      setAspectWidth(selectedDeviceMode.aspectRatio.Width)      
      CalculateAreaPlaneSize()  
    }
  }, [selectedDeviceMode])

  useEffect(() => {
    if (selectedFont !== null) {
      var apiUrl = [];
      apiUrl.push('https://fonts.googleapis.com/css?family=');
      apiUrl.push(selectedFont.fontName.replace(/ /g, '+'));
      if (selectedFont.fontVarients.includes('italic')) {
        apiUrl.push(':');
        apiUrl.push('italic');
      }
      if (selectedFont.fontVarients.includes('bold')) {
        apiUrl.push(':');
        apiUrl.push('bold');
      }
      if (selectedFont.fontSubsets.includes("greek")) {
        apiUrl.push('&subset=');
        apiUrl.push('greek');
      }
  
      // url: 'https://fonts.googleapis.com/css?family=Anonymous+Pro:italic&subset=greek'
      var url = apiUrl.join('');
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = url;
      document.head.appendChild(linkElement);
      setFontStyle(selectedFont.fontName)
    }
  }, [selectedFont])
  
  useEffect(() => {
    CalculateAreaPlaneSize()
  }, [zoomScale, height, width, selectedElementValue]);

  const updateDimensions = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  useEffect(() => {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  function addComponent(e: React.SyntheticEvent, newValue:CardElement) { 
    e.preventDefault()
    addNewOnFierbase(newValue, selectedDeviceMode.id, selectedPage.firebaseID.toString(), db)
    setComponents([...components, newValue])
  }

  useEffect(() => {
    const threshold = 0;
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }
      setScrollDir(scrollY > lastScrollY ? "scrolling down" : "scrolling up");
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    console.log(scrollDir);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDir]);

  function onMouseMoveUpdateComponents(NewComponents: any[], SelectedIndex: number, event: React.MouseEvent) {
    if (selectedElementValue != undefined) {
      const XPosition = NewComponents[SelectedIndex]["Position"]["XPosition"] * (zoomScale/100)
      const YPosition = NewComponents[SelectedIndex]["Position"]["YPosition"] * (zoomScale/100)
      const XOffset = 0
      const YOffset = 0
      //editorRef.current.getBoundingClientRect().left
      const ComponentWidth = NewComponents[SelectedIndex]["Width"]
      const ComponentHeight = NewComponents[SelectedIndex]["Height"]
      const nePositionX = (ComponentWidth  * (zoomScale/100)) + 5 + XPosition + XOffset
      const ePositionX = (ComponentWidth  * (zoomScale/100)) + 5 + XPosition + XOffset
      const sePositionX = (ComponentWidth  * (zoomScale/100)) + 5 + XPosition + XOffset
      const sPositionX = ((ComponentWidth  * (zoomScale/100)) + 5)/2 + XPosition + XOffset
      const swPositionX = 0 + XPosition + XOffset
      const wPositionX = 0 + XPosition + XOffset
      const nwPositionX = 0 + XPosition + XOffset
      const nPositionX = ((ComponentWidth  * (zoomScale/100)) + 5)/2 + XPosition + XOffset
      const nePositionY = -13 + YPosition + YOffset
      const ePositionY = ((ComponentHeight * (zoomScale/100)) - 24)/2 + YPosition + YOffset
      const sePositionY = (ComponentHeight * (zoomScale/100)) - 8 + YPosition
      const sPositionY = (ComponentHeight * (zoomScale/100))- 8 + YPosition + YOffset
      const swPositionY = (ComponentHeight  * (zoomScale/100)) - 8 + YPosition + YOffset
      const wPositionY = ((ComponentHeight  * (zoomScale/100)) - 24)/2 + YPosition + YOffset
      const nwPositionY =  -13 + YPosition + YOffset
      const nPositionY =  -13 + YPosition + YOffset
      //YOffset
      
      // console.log(
      //   "Report",
      //   "\n chaningSizeDirection:", chaningSizeDirection,
      //   "\n nePositionX:", nePositionX, 
      //   "\n ePositionX", ePositionX, 
      //   "\n sePositionX: ", sePositionX,  
      //   "\n sPositionX:", sPositionX , 
      //   "\n swPositionX:", swPositionX, 
      //   "\n wPositionX", wPositionX, 
      //   "\n nwPositionX:", nwPositionX,
      //   "\n nPositionX", nPositionX, 
      //   "\n nePositionY", nePositionY, 
      //   "\n ePositionY", ePositionY, 
      //   "\n sePositionY", sePositionY, 
      //   "\n sPositionY:", sPositionY , 
      //   "\n swPositionY:", swPositionY, 
      //   "\n wPositionY:", wPositionY,
      //   "\n nwPositionY:", nwPositionY, 
      //   "\n nPositionY ", 
      //   "\n nPositionY < sPositionY:", (nPositionY < sPositionY),
      //   "\n sPositionY < nPositionY:", sPositionY < nPositionY,
      //   "\n YPosition", NewComponents[SelectedIndex]["Position"]["YPosition"],
      //   "\n XPosition", NewComponents[SelectedIndex]["Position"]["XPosition"],
      //   )
      if (pressed){
        NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
        NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
        updateOnFierbase(NewComponents[SelectedIndex], selectedDeviceMode.id, selectedPage.firebaseID.toString(), db)
      } else {
        if (isChangeingSize) {
          if (chaningSizeDirection === "n"){
            if (sPositionY < nPositionY) {
              setChangingSizeDirection("s")
              NewComponents[SelectedIndex]["Height"] = 0
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
            } else {
              NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
            }
          }
          else if (chaningSizeDirection === "s"){
            if (!(nPositionY < sPositionY)) {
              setChangingSizeDirection("n")
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
            } else  {
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
            }
          }
          else if (chaningSizeDirection === "e"){
            if ((NewComponents[SelectedIndex]["Position"]["XPosition"] + editorRef.current.getBoundingClientRect().left) > event.clientX) {
              setChangingSizeDirection("w")
              NewComponents[SelectedIndex]["Width"] = 0
              NewComponents[SelectedIndex]["Position"]["XPosition"] = ePositionX 
            } else {
              NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementX
            }
          }
          else if (chaningSizeDirection === "w"){
            console.log("Triggering Width")
            if (wPositionX > ePositionX) {
              setChangingSizeDirection("e")
              NewComponents[SelectedIndex]["Width"] =  NewComponents[SelectedIndex]["Width"] + event.movementX
            } else {
              NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementX
              NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
            }
          }
          else if (chaningSizeDirection === "nw"){
            if (nwPositionY > swPositionY){
              setChangingSizeDirection("sw")
            } else if (nwPositionX > nePositionX){
              setChangingSizeDirection("se")
              NewComponents[SelectedIndex]["Position"]["YPosition"] = nwPositionY
            } else {
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
              NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementX
              NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
              NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
            }
          }
          else if (chaningSizeDirection === "ne"){
            if (nePositionY > sePositionY) {
              setChangingSizeDirection("se")
              NewComponents[SelectedIndex]["Position"]["YPosition"] = nePositionY
              NewComponents[SelectedIndex]["Height"] = 0
            } else if (nePositionX < nwPositionX) {
              setChangingSizeDirection("nw")
            } else {
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
              NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementX
              NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
            }
          }
          else if (chaningSizeDirection === "sw"){
            if (swPositionY < nwPositionY){
              setChangingSizeDirection("nw")
              NewComponents[SelectedIndex]["Height"] = 0
              NewComponents[SelectedIndex]["Position"]["YPosition"] = sePositionY 
            } else if (swPositionX > sePositionX) {
              setChangingSizeDirection("se")
            } else {
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
              NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementX
              NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
            }
          }
          else if (chaningSizeDirection === "se"){
            if (sePositionY < nePositionY){
              setChangingSizeDirection("ne")
              NewComponents[SelectedIndex]["Position"]["YPosition"] = sePositionY 
              NewComponents[SelectedIndex]["Height"] = 0
            } else if (sePositionX < swPositionX) {
              setChangingSizeDirection("sw")
              NewComponents[SelectedIndex]["Position"]["XPosition"] = sePositionX
              NewComponents[SelectedIndex]["Width"] = 0
            } else {
              NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
              NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementX
            }
          }
          updateOnFierbase(NewComponents[SelectedIndex], selectedDeviceMode.id, selectedPage.firebaseID.toString(), db)
        }
      }
      setLastMousePosition({x: event.clientX, y: event.clientY})
      setComponents(NewComponents)
    }
  }

  // Update the current position if mouse is down
  const onMouseMove = (event: React.MouseEvent) => {
    const NewComponents = [...components]
    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
    onMouseMoveUpdateComponents(NewComponents, SelectedIndex, event)
  }

  async function loadFirebase(){
    var newAvaiableDeviceModes: deviceModeType[] = selectedPage.deviceModes
    for(var index = 0; index < newAvaiableDeviceModes.length; index++){
      const result = await loadFromFirebase(newAvaiableDeviceModes[index].id, selectedPage.firebaseID.toString(), db)
      newAvaiableDeviceModes[index].components = result
      if (selectedPage.defaultDeviceMode !== undefined){
        if (newAvaiableDeviceModes[index].id === selectedPage.defaultDeviceMode){
          setSelectedDeviceMode(newAvaiableDeviceModes[index])
        }
      } else if (newAvaiableDeviceModes[index].order === 0) {
        setSelectedDeviceMode(newAvaiableDeviceModes[0])
      }
    }
    setAvaliableDeviceModes(newAvaiableDeviceModes)
  }

  useEffect(() => {
    CalculateAreaPlaneSize()
    loadFirebase()
  }, [])

  const handleOnClick = (e: React.SyntheticEvent, Index: CardElement) => {
    e.preventDefault();
    if (selectedElementValue?.ElementIndex === Index.ElementIndex){
        
    } else {
      setSelectedElement(Index)
    }
  };

  function DeleteFunction(){
    const NewComponents = [...components]
    const removeIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
    setSelectedElement(null)
    deleteOnFirebase(NewComponents[removeIndex], selectedDeviceMode.id, selectedPage.firebaseID.toString(), db)
    const save = NewComponents[0] 
    NewComponents[0] = NewComponents[removeIndex]
    NewComponents[removeIndex] = save
    NewComponents.shift()
    setComponents(NewComponents)
  }

  const handler = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !isUserTyping && selectedElementValue) {
      console.log("Deleteing")
      DeleteFunction()
    }
  };

  if (isNavigateToDestinations === true) {
    return <Navigate to="/government/cards/edit/destinations"/>;
  }

  function CalculateAreaPlaneSize() {
    var elementWidth = width * 0.8
    const elementHeight = height * 0.85
    if (aspectWidth >= aspectHeight){
      const newHeight = (elementWidth/aspectWidth) * aspectHeight
      console.log("new height", newHeight)
      if (newHeight > elementHeight){
        setAreaHeight((elementHeight) * (zoomScale/100))
        setAreaWidth(((elementWidth/aspectWidth) * aspectHeight) * (zoomScale/100))
      } else {
        setAreaHeight(newHeight * (zoomScale/100))
        setAreaWidth(elementWidth * (zoomScale/100))
      }
    } else {
      const newWidth = (elementHeight/aspectHeight) * aspectWidth
      if (newWidth > elementHeight){
        setAreaWidth((elementHeight) * (zoomScale/100))
        setAreaHeight(((elementHeight/aspectHeight) * aspectWidth) * (zoomScale/100))
      } else {
        setAreaWidth(newWidth * (zoomScale/100))
        setAreaHeight(elementHeight * (zoomScale/100))
      }
    }
  }

  return (
    <>
      <div onClick={() => (setIsShowingRightClick(false))} ref={outerDivRef}>
        <div className={styles.EditCardBottemView} style={{overflow:"hidden"}}>
          <Container fluid style={{height: "100%", width: "100%", padding: 0, margin: 0}}>
              <Row>
                 <Col>
                    <div className={styles.editCardBackButtonOuterContainer}>
                      <Link to="/government/cards" style={{textDecoration: "none"}}>
                        <div className={styles.editCardBackButtonInnerContainer}>
                          <Stack direction='horizontal'>
                           <IoIosArrowBack color='white'/>
                            <p className={styles.EditCardBackButton}>Back</p>
                          </Stack>
                        </div>
                      </Link>
                    </div>
                  </Col>
                  <Col xs={10} className='ml-2'>
                    <h1 className={styles.TitleEditCard}> Cards </h1>
                  </Col>
                  <Col>

                  </Col>
                  <Col>
                    <div className={styles.editCardBackButtonOuterContainer}>
                      <Button onClick={() => setIsShowingSettings(!isShowingSettings)} className={styles.SettingsButtonStyle}>
                        <FcSettings />
                      </Button>
                    </div>
                  </Col>
              </Row>
              <Row noGutters={true}>
                <Col md={2} style={{margin: 0, padding: 0, paddingLeft: "0.8%", backgroundColor: '#444444'}} className="d-none d-md-block">
                  <Toolbar onSetCanvasMode={setSelectedCanvasMode} onSetDotsText={setDotsText} dotsText={dotsText} onAddComponent={addComponent} onSetIsInDotsMode={setIsInDotsMode} 
                  onSetSelectedTextColor={setSelectedTextColor} selectedTextColor={selectedTextColor}
                  onSaveDrawMode={async (e) => {
                    const myImage = await canvasRef.current.download()
                    console.log("This is Image", myImage)
                    addComponent(e,  {ElementType: "Image", Content: myImage, Position: {XPosition: 0, YPosition: 0}, Width: 500, Height: 500, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                    setIsInDrawMode(false)
                  }} selectedBrushColor={selectedBrushColor} onSetSelectedBrushColor={setSelectedBrushColor} isInDotsMode={isInDotsMode} isInDrawMode={isInDrawMode} onSetIsNavigateToDestinations={setIsNavigateToDestinations} 
                  selectedElementValue={selectedElementValue} 
                  components={components} onSetComponents={setComponents} onSetSelectedElement={setSelectedElement} onSetBolded={(e) => {setBolded(e)}} onSetItalic={(e) => {setItalic(e)}} onSetUnderlined={(e) => {setUnderlined(e)}} onSetStrikethrough={(e) => {setStrikethrough(e)}} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} isShowingBindPage={isShowingBindPage} onSetIsShowingBindPage={setIsShowingBindPage} onSetFontSize={setFontSize} onSetSelectedFont={setSelectedFont} fontSize={fontSize} fontStyle={fontStyle} />
                </Col>
                {/* <Col style={{backgroundColor: "#793033",padding: 0, margin: 0, height: "100%"}}>
                    <div style={{height: "100%"}}> */}
                <Col className={styles.CardContainterCardCSSColumn} style={{width: "100%"}}>
                  {/* Continer */}
                    <div className={styles.CardContainterCardCSS}
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
                      tabIndex={0}
                      onKeyDown={(e) => {
                        handler(e)
                      }}
                      style={{display: (zoomScale >= 100) ? "block":"flex", justifyContent: "center", alignItems: "center", height: "85vh", width: "84vw", overflow: "scroll"}}
                    >
                      {/* <div style={{display: (zoomScale >= 100) ? "block":"flex", justifyContent: "center", alignItems: "center"}}> */}
                          <div style={ (zoomScale >= 100) ? 
                            {
                              width: areaWidth + "px",
                              height: areaHeight + "px",
                              display: "block",
                              overflow: "hidden",
                              margin: "auto",
                              padding: 0,
                              transform: "scale(" + (zoomScale/100) +")",
                              transformOrigin: "-" + (zoomScale/100) + "px" + " "+ "0" +"px"
                            }:{
                              width: areaWidth + "px",
                              height: areaHeight + "px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "auto",
                              padding: 0,
                              overflow: "scroll",
                              transform: "scale(" + (zoomScale/100) +")",
                            }}
                          >  
                          {/* Area Plane */}
                            <div 
                              style={{
                                transformOrigin: "top left",
                                backgroundColor: selectedPage.backgroundColor,
                                height: areaHeight + "px",
                                width: areaWidth + "px",
                                border: "2px solid black",
                                display: 'flex'
                              }}
                              onMouseMove={ onMouseMove }
                              ref={editorRef}
                            >
                              {/* TO DO use terneray expersions to condense into one*/}
                              <EditCardArea components={components} onSetComponents={setComponents} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle} onSetIsBolded={() => {}} onSetIsItalic={() => {}} onSetIsStrikethrough={() => {}} onSetIsUnderlined={() => {}} selectedHighlightColor={selectedHighlightColor} selectedTextColor={selectedTextColor}></EditCardArea>
                              {isInDrawMode ? 
                                <div style={{zIndex: 100}}>
                                <Canvas selectedCanvasMode={selectedCanvasMode} onSetSelectedColor={setSelectedBrushColor} width={areaWidth + "px"} height={areaHeight + "px"} selectedColor={selectedBrushColor} ref={canvasRef}/>
                                </div>:null
                              }
                              {isInDotsMode ? 
                                <div style={{zIndex: 100}}>
                                  <SVG read={false} content={dotsText} width={areaWidth} height={areaHeight} onClickContent={setDotsText} ref={svgRef}/>
                                </div>:null
                              }

                          {/* End Of Components */}
                          </div>
                        </div>
                      {/* </div> */}
                    </div>
                </Col>
              </Row>
              <Row>
                <ToolbarBottom zoomScale={zoomScale.toString()} onSetZoomScale={(e) => setZoomScale(parseFloat(e))} onSetIsShowingPaulyLibrary={setIsShowingPaulyLibrary} onSetIsShowingCardsMenu={setIsShowingCardsMenu} 
                onSetSelectedDeviceMode={(e) => {
                  console.log(e)
                  const SelectedIndex = avaliableDeviceModes.findIndex((element: deviceModeType) => element.id === selectedDeviceMode.id)
                  var newDeviceModes =  avaliableDeviceModes
                  newDeviceModes[SelectedIndex].components = components
                  setSelectedDeviceMode(e)
                  setComponents(e.components)
                }} selectedDeviceMode={selectedDeviceMode}
                  avaliableDeviceModes={avaliableDeviceModes} isShowingPaulyLibaray={isShowingPaulyLibaray} onAddComponent={addComponent} components={components} onSetInDotsMode={setIsInDotsMode} onSetInDrawMode={setIsInDrawMode} />
              </Row>
          </Container>
        </div>
        {
          //Settings menu
          isShowingSettings ?
          <PageSettings selectedPage={selectedPage}/>: null
        }
        {
          //Pauly Library
          isShowingPaulyLibaray ?
            <PaulyLibrary onAddComponent={addComponent} selectedDeviceMode={selectedDeviceMode} onSetIsShowingPaulyLibrary={setIsShowingPaulyLibrary} components={components} />:null
        }
        {
          //Cards Page
          isShowingCardsMenu ? 
          <CardAddMenu onSetIsShowingCardsMenu={setIsShowingCardsMenu} onSetIsShowingPaulyLibrary={setIsShowingPaulyLibrary} isShowingPaulyLibrary={isShowingPaulyLibaray}/>: null
        }
        {
          //Bind Page
          isShowingBindPage ? 
          <>
            <BindMenu onSetIsShowingBindPage={setIsShowingBindPage}/>
          </>:null
        }
      </div>
        {isShowingRightClick ? 
          <div>
            <Stack direction='horizontal'>
              <ListGroup style={{position: "absolute", left: MousePosition.x, top: MousePosition.y, width: "25vw", zIndex: 100}}>
                  <ListGroup.Item onClick={() => {
                      const NewComponents = [...components]
                      const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] + 1
                      setComponents(NewComponents)
                  }} style={{userSelect: "none"}}>Move Forward</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    const NewComponents = [...components]
                    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                    NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] - 1
                    setComponents(NewComponents)
                  }} style={{userSelect: "none"}}>Move Backward</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    const maxValueOfY = Math.max(...components.map((o: CardElement) => o.CurrentZIndex), 0);
                    const NewComponents = [...components]
                    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                    NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                    setComponents(NewComponents)
                  }} style={{userSelect: "none"}}>Send To Front</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    const maxValueOfY = Math.min(...components.map((o: CardElement) => o.CurrentZIndex), 0);
                    const NewComponents = [...components]
                    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                    NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                    setComponents(NewComponents)
                  }} style={{cursor: "default", userSelect: "none"}}>Send To Back</ListGroup.Item>
                  <ListGroup.Item onClick={(e) => {
                    const newUUID = create_UUID()
                    addComponent(e, {
                      ElementType: selectedElementValue.ElementType, 
                      Content: selectedElementValue.Content, 
                      Position: selectedElementValue.Position, 
                      Width: selectedElementValue.Width, 
                      Height: selectedElementValue.Height, 
                      CurrentZIndex: selectedElementValue.CurrentZIndex, 
                      ElementIndex: components.length + 2, 
                      Opacity: selectedElementValue.Opacity, 
                      CornerRadius: selectedElementValue.CornerRadius, 
                      SelectedColor: selectedElementValue.SelectedColor, 
                      SelectedFont: selectedElementValue.SelectedFont, 
                      ElementUUID: newUUID
                    })
                    setSelectedElement({
                      ElementType: selectedElementValue.ElementType, 
                      Content: selectedElementValue.Content, 
                      Position: selectedElementValue.Position, 
                      Width: selectedElementValue.Width, 
                      Height: selectedElementValue.Height, 
                      CurrentZIndex: selectedElementValue.CurrentZIndex, 
                      ElementIndex: components.length + 2, 
                      Opacity: selectedElementValue.Opacity, 
                      CornerRadius: selectedElementValue.CornerRadius, 
                      SelectedColor: selectedElementValue.SelectedColor, 
                      SelectedFont: selectedElementValue.SelectedFont, 
                      ElementUUID: newUUID
                    })
                  }} style={{cursor: "default", userSelect: "none"}}>Duplicate</ListGroup.Item>
                  <ListGroup.Item onClick={() => {DeleteFunction()}} style={{cursor: "default", userSelect: "none"}}>Delete</ListGroup.Item>
              </ListGroup>
            </Stack>
          </div>
        :null}
    </>
    
  )
}