import React from 'react'
import styles from "./Cards.module.css"
import { Stack, InputGroup, Form, Button, Dropdown } from 'react-bootstrap'
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import textIcon from "../../../images/textIcon.png"
import imageIcon from "../../../images/imageIcon.png"
import shapesIcon from "../../../images/shapesIcon.png"
import { FcLeft, FcSettings, FcIphone } from "react-icons/fc"
import {RiComputerFill} from "react-icons/ri"
import {BsTabletLandscape} from "react-icons/bs"
import {HiRectangleGroup} from "react-icons/hi2"
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import Picker from '../../../UI/Picker/Picker'

enum SelectedAspectType{
    Small,
    Medium,
    Large
}

export default function ToolbarBottom({zoomScale, onSetZoomScale, onSetIsShowingPaulyLibrary, onSetIsShowingCardsMenu, onSetSelectedDeviceMode, selectedDeviceMode, isShowingPaulyLibaray, onAddComponent, components, onSetInDotsMode, onSetInDrawMode}:
    {   zoomScale: string, 
        onSetZoomScale: (item: string) => void
        onSetIsShowingPaulyLibrary: (item: boolean) => void,
        onSetIsShowingCardsMenu: (item: boolean) => void,
        onSetSelectedDeviceMode?: (item: SelectedAspectType) => void,
        selectedDeviceMode?: SelectedAspectType,
        isShowingPaulyLibaray: boolean,
        onAddComponent: (e: React.SyntheticEvent, newValue:CardElement) => void,
        components: CardElement[],
        onSetInDotsMode: (item: boolean) => void,
        onSetInDrawMode: (item: boolean) => void
    }) {
    function onChangeSetZoomScale(value: string){
        if (value.slice(-1) == "%") {
          onSetZoomScale(value.slice(0, -1))
        } else {
          if (value.includes('%')) {
            const last = value.slice(-1)
            onSetZoomScale(value.slice(0, -2) + last)
          } else {
            onSetZoomScale(value.slice(0, -1))
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
    <div className={styles.CardToolbarDiv}>
            <div style={{gridRow: 1, gridColumn: 1}}>
                <InputGroup hasValidation>
                <InputGroup.Text id="inputGroupPrepend" onClick={() => {
                    if (parseFloat(zoomScale) >= 10){
                        onSetZoomScale("" + (parseFloat(zoomScale) - 10))
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
                    if (parseFloat(zoomScale) <= 500){
                    console.log(zoomScale)
                    const newZoom: number = parseInt(zoomScale)
                    onSetZoomScale("" + (newZoom + 10))
                    // const { setTransform } = areaContainerZoomRef.current
                    // setTransform(100,200,zoomScale/100)
                    }
                }} style={{backgroundColor: "white", padding: 0, borderRight: "2px solid black", borderBottom: "2px solid black", borderTop: "2px solid black"}}><FaArrowRight/></InputGroup.Text>
                </InputGroup>
                <input type="range" min="10" max="500" value={zoomScale} onChange={changeEvent => {
                    // const { setTransform } = areaContainerZoomRef.current
                    // setTransform(100,200,zoomScale/100)
                    onSetZoomScale(changeEvent.target.value) 
                    }} className={styles.slider} id="myRange" />
            </div>
            <div style={{gridRow: 1, gridColumn: 2}}>
                <Button className={styles.DropdownButtonStyle} onClick={(e) => {
                            onAddComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                    }}>
                        <img src={textIcon} className={styles.imgContainer } style={{maxWidth: "2vh", height: "auto"}}/>
                </Button>
            </div>
            <div style={{gridRow: 1, gridColumn: 3}}>
                <Dropdown drop='up'>
                    <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle}>
                        <img src={shapesIcon} style={{maxWidth: "2vh", height: "auto"}} className={styles.imgContainer }/>
                    </Dropdown.Toggle>
                    <DropdownMenu>
                    <Dropdown.Item eventKey="1" onClick={(e) => {
                        onAddComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                    }}>Square</Dropdown.Item>
                    <Dropdown.Item eventKey="2" onClick={(e) => {
                        onSetInDrawMode(false) //TO DO SAVE DRAW MODE
                        onSetInDotsMode(true)
                    }}>Dots</Dropdown.Item>
                    <Dropdown.Item eventKey="3" onClick={(e) => {
                        onSetInDotsMode(false) //TO DO SAVE DOS MODE
                        onSetInDrawMode(true)
                    }}>Draw</Dropdown.Item>
                    <Dropdown.Item eventKey="4">Shapes Library</Dropdown.Item>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <div style={{gridRow: 1, gridColumn: 4}}>
                <Button onClick={() => {onSetIsShowingPaulyLibrary(!isShowingPaulyLibaray)}} className={styles.DropdownButtonStyle}>
                    <img style={{maxWidth: "2vh", height: "auto"}} src={imageIcon} className={styles.imgContainer}/>
                </Button>
            </div>
            <div style={{gridRow: 1, gridColumn: 5}}>
                <Button onClick={() => {onSetIsShowingCardsMenu(true)}} className={styles.DropdownButtonStyle}>
                    <HiRectangleGroup color='black'/>
                </Button>
            </div>
        {/* Mode Selection */}
        { (selectedDeviceMode !== undefined) ?
            <div  style={{gridRow: 1, gridColumn: "6/8"}}>
                <Picker onSetSelectedIndex={(index) => {
                    if (index === 0){
                        onSetSelectedDeviceMode(SelectedAspectType.Small)
                    } else if (index === 1) {
                        onSetSelectedDeviceMode(SelectedAspectType.Medium)
                    } else if (index === 2){
                        onSetSelectedDeviceMode(SelectedAspectType.Large)
                    }
                }} selectedIndex={(selectedDeviceMode === SelectedAspectType.Small) ? 0:(selectedDeviceMode === SelectedAspectType.Medium) ? 1:2}>
                    <RiComputerFill color='black' style={{margin: 0, padding: 0}} />
                    <BsTabletLandscape color='black' style={{margin: 0, padding: 0}} />
                    <FcIphone color='black' style={{margin: 0, padding: 0}}/>
                </Picker>

            </div>:null
        }
    </div>
  )
}
