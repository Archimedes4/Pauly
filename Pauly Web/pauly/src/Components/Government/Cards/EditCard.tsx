import React, { useState, useRef, useEffect } from 'react'
import { Link, Navigate } from "react-router-dom"
import { Container, Row, Col, Button, Card, Form, Stack, Dropdown, InputGroup, ListGroup } from 'react-bootstrap';
import EditCardArea from './EditCardArea.tsx';
import textIcon from "../../../images/textIcon.png"
import imageIcon from "../../../images/imageIcon.png"
import shapesIcon from "../../../images/shapesIcon.png"
import imageOverlay from "../../../images/Iphone14.png"
import Book from "../../../images/Books.png"
import { useCardContext } from "./Cards.js"
import styles from "./Cards.module.css"
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import { FcLeft, FcSettings, FcIphone } from "react-icons/fc"
import {RiComputerFill} from "react-icons/ri"
import {BsTabletLandscape} from "react-icons/bs"
import {HiRectangleGroup} from "react-icons/hi2"
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import { getStorage, ref, uploadBytesResumable, UploadTaskSnapshot, getDownloadURL } from 'firebase/storage';
import { doc, collection, getDoc, getDocs, getFirestore, addDoc, Timestamp, serverTimestamp, FieldValue, updateDoc, where, query, DocumentData, startAt, limit, startAfter } from "firebase/firestore";
import { useAuth } from '../../../Contexts/AuthContext';
import {  LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import UploadMicrosoftFile from './uploadMicrosoftFile.tsx';
import BindMenu from './BindMenu.tsx';
import PaulyLibrary from './paulyLibrary.tsx';
import CardAddMenu from './CardAddMenu.tsx';
import Toolbar from './Toolbar.tsx';
import Canvas from "./Canvas/Canvas.js"

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
    SelectedColor: String
    SelectedFont: string
  }
  type UserType = {
    FirstName: string
    LastName: string
    Permissions: number[]
    ClassMode: number | null
    ClassPerms: string[] | null
    SportsMode: number | null
    SportsPerms: string[] | null
  }
}

enum SelectedCardBindModeType{
  Class,
  Sport,
  Commission
}

enum SelectedSettingsModeType{
  Gerneral,
  Members,
  Discription
}

interface SelectedFont {
  family: string;
  category: string;
}

type FontTypeCSS = {
  UUID: string
}

type FontType = {
  fontName: string
  fontVarients: string[]
  fontSubsets: string[]
  UUID: string
}

enum SelectedAspectType{
  Small,
  Medium,
  Large
}

export default function EditCard() {
  const outerDivRef = useRef(null)
  const { SelectedCard, zoomScale, setZoomScale, componentsSmall, setComponentsSmall, componentsMedium, setComponentsMedium, componentsLarge, setComponentsLarge } = useCardContext()
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
  const [selectedDeviceMode, setSelectedDeviceMode] = useState<SelectedAspectType>(SelectedAspectType.Small)
  const [selectedSettingsMode, setSelectedSettingsMode] = useState<SelectedSettingsModeType>(SelectedSettingsModeType.Discription)
  const [bolded, setBolded] = useState<boolean>(false)
  const [underlined, setUnderlined] = useState<boolean>(false)
  const [italic, setItalic] = useState<boolean>(false)
  const [strikethrough, setStrikethrough] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<string>("12px")
  const [fontStyle, setFontStyle] = useState<string>("Times New Roman")
  const [selectedFont, setSelectedFont] = useState<FontType>(null)
  const [isShowingBindPage, setIsShowingBindPage] = useState<boolean>(false)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserType>(null)
  const { app, db, currentUser, currentUserMicrosoftAccessToken } = useAuth()
  const [isShowingPaulyLibaray, setIsShowingPaulyLibrary] = useState(false)

  //Card Menu
  const [isShowingCardsMenu, setIsShowingCardsMenu] = useState<boolean>(false)

  //Draw Mode
  const [isInDrawMode, setIsInDrawMode] = useState(false)

  //Dots Mode
  const [isInDotsMode, setIsInDotsMode] = useState(false)

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
    if (selectedDeviceMode === SelectedAspectType.Small){
      setComponentsSmall([...componentsSmall, newValue])
    } else if (selectedDeviceMode === SelectedAspectType.Medium){
      setComponentsMedium([...componentsMedium, newValue])
    } else if (selectedDeviceMode === SelectedAspectType.Large){
      setComponentsLarge([...componentsLarge, newValue])
    }
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

  function onChangeSetZoomScale(value: string){
    if (value.slice(-1) == "%") {
      setZoomScale(value.slice(0, -1))
    } else {
      if (value.includes('%')) {
        const last = value.slice(-1)
        setZoomScale(value.slice(0, -2) + last)
      } else {
        setZoomScale(value.slice(0, -1))
      }
    }
  }

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
    if (selectedDeviceMode === SelectedAspectType.Small){
      setComponentsSmall(NewComponents)
    } else if (selectedDeviceMode === SelectedAspectType.Medium){
      setComponentsMedium(NewComponents)
    } else if (selectedDeviceMode === SelectedAspectType.Large){
      setComponentsLarge(NewComponents)
    }
  }

  // Update the current position if mouse is down
  const onMouseMove = (event: React.MouseEvent) => {
    if (selectedDeviceMode === SelectedAspectType.Small){
      const NewComponents = [...componentsSmall]
      const SelectedIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      onMouseMoveUpdateComponents(NewComponents, SelectedIndex, event)
    } else if (selectedDeviceMode === SelectedAspectType.Medium){
      const NewComponents = [...componentsMedium]
      const SelectedIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      onMouseMoveUpdateComponents(NewComponents, SelectedIndex, event)
    } else if (selectedDeviceMode === SelectedAspectType.Large){
      const NewComponents = [...componentsLarge]
      const SelectedIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      onMouseMoveUpdateComponents(NewComponents, SelectedIndex, event)
    }
  }

  useEffect(() => {
    getUserData()
    CalculateAreaPlaneSize()
  }, [])

  const handleOnClick = (e: React.SyntheticEvent, Index: CardElement) => {
    e.preventDefault();
    if (selectedElementValue?.ElementIndex === Index.ElementIndex){
        
    } else {
      setSelectedElement(Index)
    }
  };

  const handler = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !isUserTyping) {
      console.log("VVVVVVV THis THIS THIS THIS THIS THIS THIS THIS THIS this this this")
      if (selectedDeviceMode === SelectedAspectType.Small){
        console.log("THis THIS THIS THIS THIS THIS THIS THIS THIS this this this")
        const NewComponents = [...componentsSmall]
        const removeIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
        setSelectedElement(null)
        const save = NewComponents[0] 
        NewComponents[0] = NewComponents[removeIndex]
        NewComponents[removeIndex] = save
        NewComponents.shift()
        setComponentsSmall(NewComponents)
      } else if (selectedDeviceMode === SelectedAspectType.Medium){
        const NewComponents = [...componentsMedium]
        const removeIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
        setSelectedElement(null)
        const save = NewComponents[0] 
        NewComponents[0] = NewComponents[removeIndex]
        NewComponents[removeIndex] = save
        NewComponents.shift()
        setComponentsMedium(NewComponents)
      } else if (selectedDeviceMode === SelectedAspectType.Large){
        const NewComponents = [...componentsLarge]
        const removeIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
        setSelectedElement(null)
        const save = NewComponents[0] 
        NewComponents[0] = NewComponents[removeIndex]
        NewComponents[removeIndex] = save
        NewComponents.shift()
        setComponentsLarge(NewComponents)
      }
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

  function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  async function getUserData(){
    const docRef = doc(db, "Users", currentUser.uid)
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data()
      setCurrentUserInfo({FirstName: data["First Name"], LastName: data["Last Name"], Permissions: data["Permissions"], ClassMode: data["ClassMode"], ClassPerms: data["ClassPerms"], SportsMode: data["SportsMode"], SportsPerms: data["SportsPerms"]})
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
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
                        <p className={styles.EditCardBackButton}>Back</p>
                      </div>
                    </Link>
                  </div>
                </Col>
                <Col xs={10} className='ml-5'>
                  <h1 className={styles.TitleEditCard}> Edit Card </h1>
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
                <Col md={2} style={{margin: 0, padding: 0, paddingLeft: "0.8%", backgroundColor: "#444444"}} className="d-none d-md-block">
                  { (isInDrawMode) ? <p>Draw</p>:null

                  }
                  { (isInDotsMode) ? <p>Dots</p>:null

                  }
                  { (selectedElementValue || (isInDotsMode === false && isInDrawMode === false)) ? <Toolbar onSetBolded={setBolded} onSetComponentsLarge={setComponentsLarge} onSetComponentsMedium={setComponentsMedium} onSetComponentsSmall={setComponentsSmall} onSetFontSize={setFontSize} onSetSelectedFont={setSelectedFont} onSetItalic={setItalic} onSetStrikethrough={setStrikethrough} onSetUnderlined={setUnderlined} onSetIsNavigateToDestinations={setIsNavigateToDestinations} onSetIsShowingBindPage={setIsShowingBindPage} onSetSelectedElement={setSelectedElement} selectedDeviceMode={selectedDeviceMode} selectedElementValue={selectedElementValue} strikethrough={strikethrough} underlined={underlined} isShowingBindPage={isShowingBindPage} italic={italic} fontSize={fontSize} fontStyle={fontStyle} componentsLarge={componentsLarge} componentsMedium={componentsMedium} componentsSmall={componentsSmall} bolded={bolded}/>:null
                  }
                </Col>
                {/* <Col style={{backgroundColor: "#793033",padding: 0, margin: 0, height: "100%"}}>
                    <div style={{height: "100%"}}> */}
                <Col className={styles.CardContainterCardCSSColumn} style={{width: "100%"}}>
                  {/* Continer */}
                    <div style={{display: (zoomScale >= 100) ? "block":"flex"}} className={styles.CardContainterCardCSS}
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
                      <div style={{display: (zoomScale >= 100) ? "block":"flex", justifyContent: "bottom", alignItems: "bottom", overflow: "scroll"}}>
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
                                backgroundColor: "gray",
                                height: areaHeight + "px",
                                width: areaWidth + "px",
                                border: "2px solid black",
                                display: 'flex'
                              }}
                              onMouseMove={ onMouseMove }
                            >
                              { (selectedDeviceMode === SelectedAspectType.Small) ?
                                <EditCardArea components={componentsSmall} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle}></EditCardArea>:null
                              }
                              { (selectedDeviceMode === SelectedAspectType.Medium) ?
                                <EditCardArea components={componentsMedium} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle}></EditCardArea>:null
                              }
                              { (selectedDeviceMode === SelectedAspectType.Large) ?
                                <EditCardArea components={componentsLarge} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle}></EditCardArea>:null
                              }
                              { isInDrawMode ? <Canvas width={areaWidth} height={areaHeight} />: null

                              }
                          {/* End Of Components */}
                          </div>
                        </div>
                      </div>
                    </div>
                </Col>
              </Row>
              <Row>
                <div className={styles.CardToolbarDiv}>
                  <Stack direction='horizontal' gap={3} style={{padding: 0, margin: 0, width: "100%", backgroundColor: "white"}}>
                    <div style={{display: "table"}}>
                    <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle", height:"50%"}}>
                      <InputGroup hasValidation>
                        <InputGroup.Text id="inputGroupPrepend" onClick={() => {
                          if (zoomScale >= 10){
                            setZoomScale((zoomScale - 10))
                            // const { setTransform } = areaContainerZoomRef.current
                            // setTransform(100,200,zoomScale/100)
                          }
                        }} style={{backgroundColor: "white", padding:0 ,borderLeft: "2px solid black", borderBottom: "2px solid black", borderTop: "2px solid black"}}><FaArrowLeft /></InputGroup.Text>
                        <Form.Control
                          id="SetZoom"
                          onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } 
                          value={zoomScale + "%"}
                          onChange={(event) => { onChangeSetZoomScale(event.target.value) }}
                          className={styles.sizeForm}
                          style={{color:"blue", borderRadius: 0, borderRight: "none", borderLeft: "none", borderBottom: "2px solid black", borderTop: "2px solid black"}}
                        />
                        <InputGroup.Text id="inputGroupAfter" onClick={() => {
                          if (zoomScale <= 500){
                            console.log(zoomScale)
                            const newZoom: number = parseInt(zoomScale)
                            setZoomScale((newZoom + 10))
                            // const { setTransform } = areaContainerZoomRef.current
                            // setTransform(100,200,zoomScale/100)
                          }
                        }} style={{backgroundColor: "white", padding: 0, borderRight: "2px solid black", borderBottom: "2px solid black", borderTop: "2px solid black"}}><FaArrowRight/></InputGroup.Text>
                      </InputGroup>
                      <input type="range" min="10" max="500" value={zoomScale} onChange={changeEvent => {
                            // const { setTransform } = areaContainerZoomRef.current
                            // setTransform(100,200,zoomScale/100)
                            setZoomScale(changeEvent.target.value) 
                          }} className={styles.slider} id="myRange" />
                    </div>
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Button className={styles.DropdownButtonStyle}>
                            <div style={{height:"2vh"}} onClick={(e) => {
                              if (selectedDeviceMode === SelectedAspectType.Small){
                                addComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsSmall.length + 1, ElementIndex: componentsSmall.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                              } else if (selectedDeviceMode === SelectedAspectType.Medium){
                                addComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsMedium.length + 1, ElementIndex: componentsMedium.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                              } else if (selectedDeviceMode === SelectedAspectType.Large){
                                addComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsLarge.length + 1, ElementIndex: componentsLarge.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                              }
                            }}>
                              <img src={textIcon} className={styles.imgContainer }/>
                            </div>
                        </Button>
                      </div>
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Dropdown drop='up'>
                          <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle}>
                            <div style={{height:"2vh"}}>
                              <img src={shapesIcon} className={styles.imgContainer }/>
                            </div>
                          </Dropdown.Toggle>
                          <DropdownMenu>
                            <Dropdown.Item eventKey="1" onClick={(e) => {
                              if (selectedDeviceMode === SelectedAspectType.Small){
                                addComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsSmall.length + 1, ElementIndex: componentsSmall.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                              } else if (selectedDeviceMode === SelectedAspectType.Medium){
                                addComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsMedium.length + 1, ElementIndex: componentsMedium.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                              } else if (selectedDeviceMode === SelectedAspectType.Large){
                                addComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsLarge.length + 1, ElementIndex: componentsLarge.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                              }
                            }}>Square</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={(e) => {
                              setIsInDotsMode(true)
                            }}>Dots</Dropdown.Item>
                            <Dropdown.Item eventKey="3" onClick={(e) => {
                              setIsInDrawMode(true)
                            }}>Draw</Dropdown.Item>
                            <Dropdown.Item eventKey="4">Shapes Library</Dropdown.Item>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Button onClick={() => {setIsShowingPaulyLibrary(!isShowingPaulyLibaray)}} className={styles.DropdownButtonStyle}>
                          <div style={{height:"2vh"}}>
                              <img src={imageIcon} className={styles.imgContainer}/>
                            </div>
                        </Button>
                      </div>
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Button onClick={() => {setIsShowingCardsMenu(!isShowingCardsMenu)}} className={styles.DropdownButtonStyle}>
                          <div style={{height:"2vh"}}>
                              <HiRectangleGroup color='black'/>
                            </div>
                        </Button>
                      </div>
                    </div>
                    {/* Mode Selection */}
                    <div>
                      <Stack direction='horizontal'>
                        <div style={{display: "table"}}>
                          <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                            <Button onClick={() => {
                              setSelectedDeviceMode(SelectedAspectType.Small)
                            }} className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                  <RiComputerFill color='black' />
                                </div>
                            </Button>
                          </div>
                        </div>
                        <div style={{display: "table"}}>
                          <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                            <Button onClick={() => {
                              setSelectedDeviceMode(SelectedAspectType.Medium)
                            }} className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                  <BsTabletLandscape color='black' />
                                </div>
                            </Button>
                          </div>
                        </div>
                        <div style={{display: "table"}}>
                          <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                            <Button onClick={() => {
                              setSelectedDeviceMode(SelectedAspectType.Large)
                            }} className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                  <FcIphone color='black' />
                                </div>
                            </Button>
                          </div>
                        </div>
                      </Stack>
                    </div>
                  </Stack>
                </div>
              </Row>
          </Container>
        </div>
        {
          //Settings menu
          isShowingSettings ?
          <>
           
              <div className={styles.EditCardTopView}>
                <Card className={styles.settingsCard}>
                  <Card.Body>
                      <Stack direction='horizontal'>
                      { (selectedSettingsMode === SelectedSettingsModeType.Members) ? 
                        <div>Members</div>:null
                      }
                      { (selectedSettingsMode === SelectedSettingsModeType.Gerneral) ? 
                        <div>General</div>:null
                      }
                      { (selectedSettingsMode === SelectedSettingsModeType.Discription) ? 
                        <Stack>
                          <p> Edit Use </p>
                          <p> Current Use: {SelectedCard.Use}</p>
                          <Form.Label htmlFor="overlayUse">Use</Form.Label>
                          <Form.Control id="overlayUse"/>
                        </Stack>:null
                      }
                        <Stack>
                          <button onClick={() => {
                            setSelectedSettingsMode(SelectedSettingsModeType.Discription)
                          }}>Discription</button>
                          <button onClick={() => {
                            setSelectedSettingsMode(SelectedSettingsModeType.Members)
                          }}>Members</button>
                          <button onClick={() => {
                            setSelectedSettingsMode(SelectedSettingsModeType.Gerneral)
                          }}>General</button>
                        </Stack>
                      </Stack>
                  </Card.Body>
                </Card>
              </div>
          </> : null
        }
        {
          //Pauly Library
          isShowingPaulyLibaray ?
            <PaulyLibrary onAddComponent={addComponent} selectedDeviceMode={selectedDeviceMode} onSetIsShowingPaulyLibrary={setIsShowingPaulyLibrary} componentsSmall={componentsSmall} componentsMedium={componentsMedium} componentsLarge={componentsLarge} />:null
        }
        {
          //Cards Page
          isShowingCardsMenu ? 
          <CardAddMenu onSetIsShowingCardsMenu={setIsShowingCardsMenu} />: null
        }
        {
          //Bind Page
          isShowingBindPage ? 
          <>
            <BindMenu currentUserInfo={currentUserInfo} onSetIsShowingBindPage={setIsShowingBindPage}/>
          </>:null
        }
      </div>
        {isShowingRightClick ? 
          <div>
            <Stack direction='horizontal'>
              <ListGroup style={{position: "absolute", left: MousePosition.x, top: MousePosition.y, width: "25vw", zIndex: 100}}>
                  <ListGroup.Item onClick={() => {
                      if (selectedDeviceMode === SelectedAspectType.Small){
                        const NewComponents = [...componentsSmall]
                        const SelectedIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                        NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] + 1
                        setComponentsSmall(NewComponents)
                      } else if (selectedDeviceMode === SelectedAspectType.Medium){
                        const NewComponents = [...componentsMedium]
                        const SelectedIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                        NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] + 1
                        setComponentsMedium(NewComponents)
                      } else if (selectedDeviceMode === SelectedAspectType.Large){
                        const NewComponents = [...componentsLarge]
                        const SelectedIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                        NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] + 1
                        setComponentsLarge(NewComponents)
                      }
                  }}>Move Forward</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    if (selectedDeviceMode === SelectedAspectType.Small){
                      const NewComponents = [...componentsSmall]
                      const SelectedIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] - 1
                      setComponentsSmall(NewComponents)
                    } else if (selectedDeviceMode === SelectedAspectType.Medium){
                      const NewComponents = [...componentsMedium]
                      const SelectedIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] - 1
                      setComponentsMedium(NewComponents)
                    } else if (selectedDeviceMode === SelectedAspectType.Large){
                      const NewComponents = [...componentsLarge]
                      const SelectedIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] - 1
                      setComponentsLarge(NewComponents)
                    }
                  }}>Move Backward</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    if (selectedDeviceMode === SelectedAspectType.Small){
                      const maxValueOfY = Math.max(...componentsSmall.map((o: CardElement) => o.CurrentZIndex), 0);
                      const NewComponents = [...componentsSmall]
                      const SelectedIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                      setComponentsSmall(NewComponents)
                    } else if (selectedDeviceMode === SelectedAspectType.Medium){
                      const maxValueOfY = Math.max(...componentsMedium.map((o: CardElement) => o.CurrentZIndex), 0);
                      const NewComponents = [...componentsMedium]
                      const SelectedIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                      setComponentsMedium(NewComponents)
                    } else if (selectedDeviceMode === SelectedAspectType.Large){
                      const maxValueOfY = Math.max(...componentsLarge.map((o: CardElement) => o.CurrentZIndex), 0);
                      const NewComponents = [...componentsLarge]
                      const SelectedIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                      setComponentsLarge(NewComponents)
                    }
                  }}>Send To Front</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    if (selectedDeviceMode === SelectedAspectType.Small){
                      const maxValueOfY = Math.min(...componentsSmall.map((o: CardElement) => o.CurrentZIndex), 0);
                      const NewComponents = [...componentsSmall]
                      const SelectedIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                      setComponentsSmall(NewComponents)
                    } else if (selectedDeviceMode === SelectedAspectType.Medium){
                      const maxValueOfY = Math.min(...componentsMedium.map((o: CardElement) => o.CurrentZIndex), 0);
                      const NewComponents = [...componentsMedium]
                      const SelectedIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                      setComponentsMedium(NewComponents)
                    } else if (selectedDeviceMode === SelectedAspectType.Large){
                      const maxValueOfY = Math.min(...componentsLarge.map((o: CardElement) => o.CurrentZIndex), 0);
                      const NewComponents = [...componentsLarge]
                      const SelectedIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                      setComponentsLarge(NewComponents)
                    }
                  }} style={{cursor: "default"}}>Send To Back</ListGroup.Item>
                  <ListGroup.Item>Duplicate</ListGroup.Item>
              </ListGroup>
            </Stack>
          </div>
        :null}
    </>
    
  )
}
