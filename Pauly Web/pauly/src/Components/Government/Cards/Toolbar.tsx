import React, {useState, useRef, Ref, useEffect} from 'react'
import { Row, Container, Button, Dropdown, Stack } from 'react-bootstrap'
import styles from "./Cards.module.css"
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import Book from "../../../images/Books.png"
import {FaBold, FaItalic, FaUnderline, FaStrikethrough} from "react-icons/fa"
import {save} from './Canvas/CanvasHooks';
import ReactQuill from 'react-quill'
import "react-quill/dist/quill.snow.css";
import { useCardContext } from "./Cards"
import { CanvasModeType } from './Canvas/Canvas';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../Contexts/AuthContext';

enum SelectedAspectType{
    Small,
    Medium,
    Large
} 

type FontType = {
    fontName: string
    fontVarients: string[]
    fontSubsets: string[]
    UUID: string
}

function Toolbar({onSetIsNavigateToDestinations, selectedElementValue, components, onSetComponents, onSetSelectedElement, onSetBolded, onSetItalic, onSetUnderlined, onSetStrikethrough,
    bolded, italic, underlined, strikethrough, isShowingBindPage, onSetIsShowingBindPage, onSetFontSize,
    fontSize, fontStyle, onSetSelectedFont, isInDotsMode, isInDrawMode, onAddComponent, onSetIsInDotsMode, onSaveDrawMode, dotsText, onSetDotsText, selectedTextColor, onSetSelectedTextColor,
    selectedBrushColor, onSetSelectedBrushColor, onSetCanvasMode
}:{
    onSetIsNavigateToDestinations?: (item: boolean) => void, 
    selectedElementValue: CardElement, 
    components: CardElement[],
    onSetComponents: (item: CardElement[]) => void,
    onSetSelectedElement: (item: CardElement) => void,
    isShowingBindPage: boolean,
    onSetIsShowingBindPage: (item: boolean) => void,
    //text
    bolded: boolean,
    onSetBolded: (item:boolean) => void,
    italic: boolean,
    onSetItalic: (item:boolean) => void,
    underlined: boolean,
    onSetUnderlined: (item:boolean) => void,
    strikethrough: boolean,
    onSetStrikethrough: (item:boolean) => void,
    onSetFontSize: (item: string) => void,
    onSetSelectedFont: (item: FontType) => void,
    fontSize: string,
    fontStyle: string,
    selectedTextColor: string,
    onSetSelectedTextColor: (item: string) => void,

    //Shapes
    isInDrawMode: boolean,
    isInDotsMode: boolean,
    onSaveDrawMode: (e: React.SyntheticEvent) => void,
    onSetIsInDotsMode: (item: boolean) => void,
    onAddComponent: (e: React.SyntheticEvent, newValue:CardElement) => void,
    dotsText: string,
    onSetDotsText: (item: string) => void,
    selectedBrushColor: string,
    onSetSelectedBrushColor: (item: string) => void,
    onSetCanvasMode?: (item: CanvasModeType) => void
    }) {
    const [fontList, setFontList] = useState<FontType []>([])
    const avaliableFontSizes: string[] = ["8px", "12px", "14px", "16px", "20px", "24px"]
    const [showingFontSelectedMenu, setShowingFontSelectionMenu] = useState<boolean>(false)
    const { SelectedPage } = useCardContext()
    const { db, currentUserMicrosoftAccessToken } = useAuth()
    const [appIconURL, setAppIconURL] = useState("")
    const [opacity, setOpacity] = useState<number>(1)
    const [selectedColor, setSelectedColor] = useState("")

    useEffect(() => {
        fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB-YMRvC6BSysmmxt5ZQGIZ06izNO20lU8')
        .then(response => response.json())
        .then((data) => {
            var NewArray = []
            for(var index = 0; index < data["items"].length; index++){
            NewArray.push({ fontName:  data["items"][index]["family"], fontVarients: data["items"][index]["variants"], fontSubsets: data["items"][index]["subsets"], UUID: create_UUID()})
            }
            setFontList(NewArray)
        })
    }, [])

    useEffect(() => {
        loadPageData()
    }, [SelectedPage.BindRef])

    function create_UUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    async function loadPageData(){
        if (SelectedPage.BindRef !== ""){
          const BindArray = SelectedPage.BindRef.split("-")
          if (BindArray[0] === "Class" && BindArray.length >= 4){
            const classDocRef = doc(db, "Grade"+BindArray[1]+"Courses", BindArray[2], "Sections", (BindArray[3] == "0") ? "0":BindArray[3]+"-"+BindArray[4])
            const classDocSnapshot = await getDoc(classDocRef)
            if (classDocSnapshot.exists()){
              const classData = classDocSnapshot.data()
              getTeamsAvatar(classData["TeamID"])
              const teacherDocRef = doc(db, "Users", classData["Teacher"])
              const teacherDocSnap = await getDoc(teacherDocRef)
              if (teacherDocSnap.exists()){
                const teacherData = teacherDocSnap.data()
                getTeacherLastMessage(teacherData["Teacher"], classData["TeamID"])
              }
            } else {
              //TO DO handel error
            }
          }
        }
    }

    async function getTeacherLastMessage(TeacherMicrosoftID: string, TeamId: string) {
        const response = await fetch("https://graph.microsoft.com/v1.0/teams/"+TeamId+"/channels", {method: "Get", headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },})
        const data = await response.json()
        if (response.status === 200){
            for (var index = 0; index < data["value"].length; index++){
                const channelID: string = data["value"][index]["id"]
                const channelResponse = await fetch("https://graph.microsoft.com/v1.0/chats/"+channelID, {method: "Get", headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + currentUserMicrosoftAccessToken
                },})
                const channelData = channelResponse.json()
    
            }
        } else {
            if (response.status === 401){
                //To DO handle unautorized
            } else if (response.status === 403) {
                //TO DO handle and log error
            } else {
                //TO Do create default catch all
            }
        }
    }
    
    async function getTeamsAvatar(TeamId: string) {
        const response = await fetch("https://graph.microsoft.com/v1.0/teams/"+TeamId+"/photo/$value", {method: "Get", headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + currentUserMicrosoftAccessToken
        },})
        const dataBlob = await response.blob()
        const url = URL.createObjectURL(dataBlob)
        setAppIconURL(url)
        console.log(url) 
    }

    function hexToRgb(hex: string) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
        });
      
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    function rgbaToHex(rgba: string) {
        const RGBArray = rgba.split(/[(), ]/)
        if (RGBArray.length === 9){
            function componentToHex(c: string) {
                var hex = parseInt(c).toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }
            return "#" + componentToHex(RGBArray[1]) + componentToHex(RGBArray[3]) + componentToHex(RGBArray[5])
        }
    }

    return (
        <div>
            { selectedElementValue ? 
                <Container style={{margin: 0, padding: 0, height: "100%", backgroundColor: '#444444', width: "100%"}}>
                    <Row>
                    <Button onClick={() => onSetIsNavigateToDestinations(true)}>
                        Destination
                    </Button>
                    </Row>
                    { (selectedElementValue.ElementType === "Shape") ? 
                    <>
                        <Row>
                        <p>Corner Radius: {selectedElementValue.CornerRadius}%</p>
                        <input type="range" min="1" max="50" value={selectedElementValue.CornerRadius} 
                        onChange={changeEvent => {
                            const NewComponents = [...components]
                            const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                            NewComponents[SelectedIndex]["CornerRadius"] = parseInt(changeEvent.target.value)
                            onSetComponents(NewComponents)
                            onSetSelectedElement(NewComponents[SelectedIndex])
                        }} 
                        className={styles.slider} id="myRange" />
                        </Row>
                        <Row>
                        <input type="color" id="colorpicker" value={selectedElementValue.SelectedColor.toString()} onChange={changeEvent => {
                            const NewComponents = [...components]
                            const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                            NewComponents[SelectedIndex]["SelectedColor"] = changeEvent.target.value
                            onSetComponents(NewComponents)
                            onSetSelectedElement(NewComponents[SelectedIndex])
                        }} />
                        </Row>
                    </>:null
                    }
                    { (selectedElementValue.ElementType === "Text") ?
                    <>
                        <Row>
                        {/* <EditorToolbar /> */}
                        <Stack direction='horizontal' style={{paddingTop: "2%", paddingBottom: "2%"}}>
                            <button onClick={(e) => {
                            e.preventDefault()
                            onSetBolded(!bolded)
                            }} className={`${bolded ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)} ql-bold`}>
                            <FaBold />
                            </button>
                            <button onClick={(e) => {
                            e.preventDefault()
                            onSetItalic(!italic)
                            }} className={italic ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                            <FaItalic />
                            </button>
                            <button onClick={(e) => {
                            e.preventDefault()
                            onSetUnderlined(!underlined)
                            }} className={underlined ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                            <FaUnderline />
                            </button>
                            <button onClick={(e) => {
                            e.preventDefault()
                            onSetStrikethrough(!strikethrough)
                            }} className={strikethrough ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                            <FaStrikethrough />
                            </button>
                        </Stack>
                        <button onClick={() => {
                            setShowingFontSelectionMenu(!showingFontSelectedMenu)
                        }}>
                            Font: {fontStyle}
                        </button>
                        { showingFontSelectedMenu ? 
                            <div style={{display: "hidden"}}>
                            <div className={styles.FontSelectionDivContainer}>
                                {fontList.map((font: FontType) => (
                                <button className={styles.FontSelectionButton} onClick={(e) => {e.preventDefault(); onSetSelectedFont(font)}}>{font.fontName}</button>
                                ))}
                            </div>
                            </div>:null
                        }
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle}>
                            <div style={{height:"2vh"}}>
                                <p> Font Size: {fontSize} </p>
                            </div>
                            </Dropdown.Toggle>
                            <DropdownMenu>
                            { avaliableFontSizes.map((size: string) => (
                                <Dropdown.Item onClick={e => {
                                e.preventDefault()
                                onSetFontSize(size)
                                }}>{size}</Dropdown.Item>
                            ))}
                            </DropdownMenu>
                        </Dropdown>
                        </Row>
                        <Row>
                            <input type="color" id="colorpicker" value={rgbaToHex(selectedTextColor)} onChange={changeEvent => {
                                const RgbResult = hexToRgb(changeEvent.target.value)
                                onSetSelectedTextColor(`rgba(${RgbResult.r}, ${RgbResult.g}, ${RgbResult.b}, ${opacity})`)
                            }} />
                        </Row>
                    </>:null
                    }
                    <Row>
                    <p>Opacity: {selectedElementValue.Opacity}%</p>
                    <input type="range" min="1" max="100" value={selectedElementValue.Opacity} 
                    onChange={changeEvent => {
                        const NewComponents = [...components]
                        const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                        NewComponents[SelectedIndex]["Opacity"] = parseInt(changeEvent.target.value)
                        onSetComponents(NewComponents)
                        onSetSelectedElement(NewComponents[SelectedIndex])
                    }} 
                    className={styles.slider} id="myRange" />
                    </Row>
                </Container>: <>
                {
                    isInDotsMode ? 
                    <div> 
                        DOTS MODE 
                        <button onClick={(e) => {
                            onAddComponent(e,  {ElementType: "SVG", Content: dotsText, Position: {XPosition: 0, YPosition: 0}, Width: 500, Height: 500, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                            onSetIsInDotsMode(false)
                            onSetDotsText("")
                        }}>
                            Place
                        </button>
                    </div>:null
                }

                {
                    isInDrawMode ? 
                    <div> 
                        DRAW MODE 
                        <button onClick={(e) => {
                            onSaveDrawMode(e)
                            onSetCanvasMode(CanvasModeType.Draw)
                        }}>
                            Place
                        </button>
                        <input type="color" id="colorpicker" value={selectedBrushColor} onChange={changeEvent => {
                            onSetSelectedBrushColor(changeEvent.target.value)
                        }} />
                        <button onClick={() => {
                            onSetCanvasMode(CanvasModeType.PickColor)
                        }}>Pick Color</button>
                    </div>:null
                }
                { (isInDotsMode === false && isInDrawMode === false) ? 
                    <div>
                        {
                            (SelectedPage.BindRef === "") ? 
                            <Container style={{backgroundColor: '#444444', height: "100%", width: "100%", margin: 0, padding: 0}}>
                                <div style={{display: "flex", justifyContent: "center"}}>
                                    <p style={{fontSize: "16px", padding: 0, margin: 0, marginTop: "5%", color: "white"}}>Connect Your Page</p>
                                </div>
                                <div style={{display: "flex", justifyContent: "center"}}>
                                    <img src={Book} alt='Book' style={{width: "80%"}}/>
                                </div>
                                <div  style={{display: "flex", justifyContent: "center"}}>
                                    <button onClick={() => {onSetIsShowingBindPage(!isShowingBindPage)}} className={styles.BindingButton}>
                                        Bind
                                    </button>
                                </div>
                            </Container>: <Container style={{backgroundColor: '#444444', height: "100%", width: "100%", margin: 0, padding: 0}}>
                                <div style={{display: "flex", justifyContent: "center"}}>
                                    <p style={{fontSize: "16px", padding: 0, margin: 0, marginTop: "5%", color: "white"}}>Page Connected</p>
                                </div>
                                <div style={{display: "flex", justifyContent: "center"}}>
                                    <img src={Book} alt='Book' style={{width: "80%"}}/>
                                </div>
                                <div style={{display: "flex", justifyContent: "center"}}>
                                    <p style={{fontSize: "16px", padding: 0, margin: 0, marginTop: "5%", color: "white"}}>Assests</p>
                                </div>
                                <div>
                                    { (appIconURL !== "") ?
                                        <button onClick={(e) => {
                                            onAddComponent(e,  {ElementType: "Image", Content: appIconURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                        }}>
                                            <img src={appIconURL} style={{height: "50%", width: "50%"}} draggable={false}/>
                                        </button>:null
                                    }
                                    <button>
                                        Assignment
                                    </button>
                                    <button>
                                        <div>
                                            <p>Last Message From Teacher</p>

                                        </div>
                                    </button>
                                </div>
                            </Container>
                        }
                    </div>:null
                }
                </>
            }
        </div>
    )
}

export default Toolbar