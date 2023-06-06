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
import { doc, collection, getDoc, getDocs, getFirestore, addDoc, Timestamp, serverTimestamp, FieldValue, updateDoc, where, query, DocumentData, startAt, limit, startAfter, setDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from '../../../Contexts/AuthContext';
import UploadMicrosoftFile from './uploadMicrosoftFile.tsx';
import BindMenu from './BindMenu.tsx';
import PaulyLibrary from './paulyLibrary.tsx';
import CardAddMenu from './CardAddMenu.tsx';
import Toolbar from './Toolbar.tsx';
import ToolbarBottom from './ToolbarBottom.tsx';
import Canvas from "./Canvas/Canvas.js"
import SVG from './SVG.tsx';
import {IoIosArrowBack} from "react-icons/io"

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
    CourseName: string,
    DayA: number,
    DayB: number,
    DayC: number,
    DayD: number,
    noClass: string[],
    schoolYear: number,
    section: number,
    Semester: number,
    Teacher: string
  }
}

enum SelectedAspectType{
  Small,
  Medium,
  Large
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
  const [isShowingBindPage, setIsShowingBindPage] = useState<boolean>(false)
  const [showingFontSelectedMenu, setShowingFontSelectionMenu] = useState<boolean>(false)
  const { app, db, currentUser, currentUserMicrosoftAccessToken } = useAuth()
  const [isShowingPaulyLibaray, setIsShowingPaulyLibrary] = useState(false)

  //TextSettings
  const [bolded, setBolded] = useState<boolean>(false)
  const [underlined, setUnderlined] = useState<boolean>(false)
  const [italic, setItalic] = useState<boolean>(false)
  const [strikethrough, setStrikethrough] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<string>("12px")
  const [fontStyle, setFontStyle] = useState<string>("Times New Roman")
  const [selectedFont, setSelectedFont] = useState<FontType>(null)
  const [selectedTextColor, setSelectedTextColor] = useState("#000000")
  const textEditorRef = useRef(null)


  //Card Menu
  const [isShowingCardsMenu, setIsShowingCardsMenu] = useState<boolean>(false)


  const [isInDotsMode, setIsInDotsMode] = useState(false)
  const [isInDrawMode, setIsInDrawMode] = useState(false)
  const [dotsText, setDotsText] = useState("")
  const canvasRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    if (selectedDeviceMode === SelectedAspectType.Large){
      {/* 16:9 */}
    } else if (selectedDeviceMode === SelectedAspectType.Medium){
      {/* 16:9 */}
    } else if (selectedDeviceMode === SelectedAspectType.Small){
      
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
    addNewOnFierbase(newValue)
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

  function onMouseMoveUpdateComponents(NewComponents: any[], SelectedIndex: number, event: React.MouseEvent) {
    if (pressed){
      if (selectedElementValue != undefined) {
          NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
          NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
          updateOnFierbase(NewComponents[SelectedIndex])
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
              updateOnFierbase(NewComponents[SelectedIndex])
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
    CalculateAreaPlaneSize()
    loadFromFirebase()
  }, [])

  const handleOnClick = (e: React.SyntheticEvent, Index: CardElement) => {
    e.preventDefault();
    if (selectedElementValue?.ElementIndex === Index.ElementIndex){
        
    } else {
      setSelectedElement(Index)
    }
  };

  function DeleteFunction(){
    if (selectedDeviceMode === SelectedAspectType.Small){
      const NewComponents = [...componentsSmall]
      const removeIndex = componentsSmall.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      setSelectedElement(null)
      deleteOnFirebase(NewComponents[removeIndex])
      const save = NewComponents[0] 
      NewComponents[0] = NewComponents[removeIndex]
      NewComponents[removeIndex] = save
      NewComponents.shift()
      setComponentsSmall(NewComponents)
    } else if (selectedDeviceMode === SelectedAspectType.Medium){
      const NewComponents = [...componentsMedium]
      const removeIndex = componentsMedium.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      deleteOnFirebase(NewComponents[removeIndex])
      setSelectedElement(null)
      const save = NewComponents[0] 
      NewComponents[0] = NewComponents[removeIndex]
      NewComponents[removeIndex] = save
      NewComponents.shift()
      setComponentsMedium(NewComponents)
    } else if (selectedDeviceMode === SelectedAspectType.Large){
      const NewComponents = [...componentsLarge]
      const removeIndex = componentsLarge.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      deleteOnFirebase(NewComponents[removeIndex])
      setSelectedElement(null)
      const save = NewComponents[0] 
      NewComponents[0] = NewComponents[removeIndex]
      NewComponents[removeIndex] = save
      NewComponents.shift()
      setComponentsLarge(NewComponents)
    }
  }

  const handler = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !isUserTyping) {
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

  function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }


  async function addNewOnFierbase(item: CardElement) {
    if (selectedDeviceMode === SelectedAspectType.Small){
      await setDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Small", item.ElementUUID), {
        ElementType: item.ElementType,
        Content: item.Content,
        PositionX: item.Position.XPosition,
        PositionY: item.Position.YPosition,
        Width: item.Width,
        Height: item.Height,
        CurrentZIndex: item.CurrentZIndex,
        ElementIndex: item.ElementIndex,
        Opacity: item.Opacity,
        CornerRadius: item.CornerRadius,
        SelectedColor: item.SelectedColor,
        SelectedFont: item.SelectedFont,
        ElementUUID: item.ElementUUID
      })
    } else if (selectedDeviceMode === SelectedAspectType.Medium) {
      await setDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Medium", item.ElementUUID), {
        ElementType: item.ElementType,
        Content: item.Content,
        PositionX: item.Position.XPosition,
        PositionY: item.Position.YPosition,
        Width: item.Width,
        Height: item.Height,
        CurrentZIndex: item.CurrentZIndex,
        ElementIndex: item.ElementIndex,
        Opacity: item.Opacity,
        CornerRadius: item.CornerRadius,
        SelectedColor: item.SelectedColor,
        SelectedFont: item.SelectedFont,
        ElementUUID: item.ElementUUID
      })
    } else if  (selectedDeviceMode === SelectedAspectType.Large) {
      await setDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Large", item.ElementUUID), {
        ElementType: item.ElementType,
        Content: item.Content,
        PositionX: item.Position.XPosition,
        PositionY: item.Position.YPosition,
        Width: item.Width,
        Height: item.Height,
        CurrentZIndex: item.CurrentZIndex,
        ElementIndex: item.ElementIndex,
        Opacity: item.Opacity,
        CornerRadius: item.CornerRadius,
        SelectedColor: item.SelectedColor,
        SelectedFont: item.SelectedFont,
        ElementUUID: item.ElementUUID
      })
    }
  }

  async function updateOnFierbase(item: CardElement) {
    if (selectedDeviceMode === SelectedAspectType.Small){
      await updateDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Small", item.ElementUUID), {
        ElementType: item.ElementType,
        Content: item.Content,
        PositionX: item.Position.XPosition,
        PositionY: item.Position.YPosition,
        Width: item.Width,
        Height: item.Height,
        CurrentZIndex: item.CurrentZIndex,
        ElementIndex: item.ElementIndex,
        Opacity: item.Opacity,
        CornerRadius: item.CornerRadius,
        SelectedColor: item.SelectedColor,
        SelectedFont: item.SelectedFont,
        ElementUUID: item.ElementUUID
      })
    } else if (selectedDeviceMode === SelectedAspectType.Medium) {
      await updateDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Medium", item.ElementUUID), {
        ElementType: item.ElementType,
        Content: item.Content,
        PositionX: item.Position.XPosition,
        PositionY: item.Position.YPosition,
        Width: item.Width,
        Height: item.Height,
        CurrentZIndex: item.CurrentZIndex,
        ElementIndex: item.ElementIndex,
        Opacity: item.Opacity,
        CornerRadius: item.CornerRadius,
        SelectedColor: item.SelectedColor,
        SelectedFont: item.SelectedFont,
        ElementUUID: item.ElementUUID
      })
    } else if  (selectedDeviceMode === SelectedAspectType.Large) {
      await updateDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Large", item.ElementUUID), {
        ElementType: item.ElementType,
        Content: item.Content,
        PositionX: item.Position.XPosition,
        PositionY: item.Position.YPosition,
        Width: item.Width,
        Height: item.Height,
        CurrentZIndex: item.CurrentZIndex,
        ElementIndex: item.ElementIndex,
        Opacity: item.Opacity,
        CornerRadius: item.CornerRadius,
        SelectedColor: item.SelectedColor,
        SelectedFont: item.SelectedFont,
        ElementUUID: item.ElementUUID
      })
    }
  }
  async function deleteOnFirebase(item: CardElement) {
    if (selectedDeviceMode === SelectedAspectType.Small){
      await deleteDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Small", item.ElementUUID))
    } else if (selectedDeviceMode === SelectedAspectType.Medium) {
      await deleteDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Medium", item.ElementUUID))
    } else if  (selectedDeviceMode === SelectedAspectType.Large) {
      await deleteDoc(doc(db, "Pages", SelectedCard.FirebaseID.toString(), "Large", item.ElementUUID))
    }
  }
  async function loadFromFirebase(){
    console.log("Card", SelectedCard)
    var resultSmall: CardElement[] = []
    const snapshotSmall = await getDocs(collection(db, "Pages", SelectedCard.FirebaseID.toString(), "Small"))
    snapshotSmall.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      const data = doc.data()
      resultSmall.push({
        ElementType: data.ElementType,
        Content: data.Content,
        Position: {
          XPosition: data.PositionX,
          YPosition: data.PositionY
        },
        Width: data.Width,
        Height: data.Height,
        CurrentZIndex: data.CurrentZIndex,
        ElementIndex: data.ElementIndex,
        Opacity: data.Opacity,
        CornerRadius: data.CornerRadius,
        SelectedColor: data.SelectedColor,
        SelectedFont: data.SelectedFont,
        ElementUUID: data.ElementUUID
      })
    })
    setComponentsSmall(resultSmall)
    var resultMedium: CardElement[] = []
    const snapshotMedium = await getDocs(collection(db, "Pages", SelectedCard.FirebaseID.toString(), "Medium"))
    snapshotMedium.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      const data = doc.data()
      resultMedium.push({
        ElementType: data.ElementType,
        Content: data.Content,
        Position: {
          XPosition: data.PositionX,
          YPosition: data.PositionY
        },
        Width: data.Width,
        Height: data.Height,
        CurrentZIndex: data.CurrentZIndex,
        ElementIndex: data.ElementIndex,
        Opacity: data.Opacity,
        CornerRadius: data.CornerRadius,
        SelectedColor: data.SelectedColor,
        SelectedFont: data.SelectedFont,
        ElementUUID: data.ElementUUID
      })
    })
    setComponentsMedium(resultMedium)
    var resultLarge: CardElement[] = []
    const snapshotLarge = await getDocs(collection(db, "Pages", SelectedCard.FirebaseID.toString(), "Small"))
    snapshotLarge.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      const data = doc.data()
      resultLarge.push({
        ElementType: data.ElementType,
        Content: data.Content,
        Position: {
          XPosition: data.PositionX,
          YPosition: data.PositionY
        },
        Width: data.Width,
        Height: data.Height,
        CurrentZIndex: data.CurrentZIndex,
        ElementIndex: data.ElementIndex,
        Opacity: data.Opacity,
        CornerRadius: data.CornerRadius,
        SelectedColor: data.SelectedColor,
        SelectedFont: data.SelectedFont,
        ElementUUID: data.ElementUUID
      })
    })
    setComponentsLarge(resultLarge)
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
                  <Toolbar onSetDotsText={setDotsText} dotsText={dotsText} onAddComponent={addComponent} onSetIsInDotsMode={setIsInDotsMode} 
                  onSetSelectedTextColor={setSelectedTextColor} selectedTextColor={selectedTextColor}
                  onSaveDrawMode={async (e) => {
                    const myImage = await canvasRef.current.download()
                    console.log("This is Image", myImage)
                    addComponent(e,  {ElementType: "Image", Content: myImage, Position: {XPosition: 0, YPosition: 0}, Width: 500, Height: 500, CurrentZIndex: componentsSmall.length + 1, ElementIndex: componentsSmall.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                    setIsInDrawMode(false)
                  }} isInDotsMode={isInDotsMode} isInDrawMode={isInDrawMode} onSetIsNavigateToDestinations={setIsNavigateToDestinations} selectedElementValue={selectedElementValue} components={(selectedDeviceMode === SelectedAspectType.Small) ? componentsSmall:(selectedDeviceMode === SelectedAspectType.Medium) ? componentsMedium:componentsLarge} onSetComponents={(selectedDeviceMode === SelectedAspectType.Small) ? setComponentsSmall:(selectedDeviceMode === SelectedAspectType.Medium) ? setComponentsMedium:setComponentsLarge} onSetSelectedElement={setSelectedElement} onSetBolded={(e) => {setBolded(e); textEditorRef.current.bold()}} onSetItalic={(e) => {setItalic(e); textEditorRef.current.italic()}} onSetUnderlined={(e) => {setUnderlined(e); textEditorRef.current.underline()}} onSetStrikethrough={(e) => {setStrikethrough(e); textEditorRef.current.strikethrough()}} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} isShowingBindPage={isShowingBindPage} onSetIsShowingBindPage={setIsShowingBindPage} onSetFontSize={setFontSize} onSetSelectedFont={setSelectedFont} fontSize={fontSize} fontStyle={fontStyle} />
                </Col>
                {/* <Col style={{backgroundColor: "#793033",padding: 0, margin: 0, height: "100%"}}>
                    <div style={{height: "100%"}}> */}
                <Col className={styles.CardContainterCardCSSColumn} style={{width: "100%"}}>
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
                                backgroundColor: "gray",
                                height: areaHeight + "px",
                                width: areaWidth + "px",
                                border: "2px solid black",
                                display: 'flex'
                              }}
                              onMouseMove={ onMouseMove }
                            >
                              { (selectedDeviceMode === SelectedAspectType.Small) ?
                                <EditCardArea ref={textEditorRef} components={componentsSmall} onSetComponents={setComponentsSmall} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle} onSetIsBolded={() => {}}></EditCardArea>:null
                              }
                              { (selectedDeviceMode === SelectedAspectType.Medium) ?
                                <EditCardArea ref={textEditorRef} components={componentsMedium} onSetComponents={setComponentsMedium} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle} onSetIsBolded={() => {}}></EditCardArea>:null
                              }
                              { (selectedDeviceMode === SelectedAspectType.Large) ?
                                <EditCardArea ref={textEditorRef} components={componentsLarge} onSetComponents={setComponentsLarge} zoomScale={zoomScale} onClick={handleOnClick} bolded={bolded} italic={italic} underlined={underlined} strikethrough={strikethrough} onPressed={setPressed} onSetMousePosition={setMousePosition} onIsShowingRightClick={setIsShowingRightClick} selectedElementValue={selectedElementValue} isShowingRightClick={isShowingRightClick} onIsChangingSize={setIsChangingSize} onChangingSizeDirection={setChangingSizeDirection} onIsUserTyping={setIsUserTypeing} isUserTyping={isUserTyping} fontSize={fontSize} fontStyle={fontStyle} onSetIsBolded={() => {}}></EditCardArea>:null
                              }
                              {isInDrawMode ? 
                                <Canvas onCanvas={(item: string) => {
                                  console.log(item)
                                }} width={areaWidth + "px"} height={areaHeight + "px"} ref={canvasRef}/>:null
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
                <ToolbarBottom zoomScale={zoomScale} onSetZoomScale={setZoomScale} onSetIsShowingPaulyLibrary={setIsShowingPaulyLibrary} onSetIsShowingCardsMenu={setIsShowingCardsMenu} onSetSelectedDeviceMode={setSelectedDeviceMode} selectedDeviceMode={selectedDeviceMode}
                isShowingPaulyLibaray={isShowingPaulyLibaray} onAddComponent={addComponent} components={(selectedDeviceMode === SelectedAspectType.Small) ? componentsSmall:(selectedDeviceMode === SelectedAspectType.Medium) ? componentsMedium:componentsLarge} onSetInDotsMode={setIsInDotsMode} onSetInDrawMode={setIsInDrawMode} />
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
                  <ListGroup.Item onClick={() => {DeleteFunction()}}>Delete</ListGroup.Item>
              </ListGroup>
            </Stack>
          </div>
        :null}
    </>
    
  )
}