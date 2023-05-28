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

export default function ToolbarBottom({zoomScale, onSetZoomScale, onSetIsShowingPaulyLibrary, onSetIsShowingCardsMenu, onSetSelectedDeviceMode, selectedDeviceMode, isShowingPaulyLibaray, isShowingCardsMenu, onAddComponent, components}:
    {   zoomScale: string, 
        onSetZoomScale: (item: string) => void
        onSetIsShowingPaulyLibrary: (item: boolean) => void,
        onSetIsShowingCardsMenu: (item: boolean) => void,
        onSetSelectedDeviceMode: (item: SelectedAspectType) => void,
        selectedDeviceMode: SelectedAspectType,
        isShowingPaulyLibaray: boolean,
        isShowingCardsMenu: boolean,
        onAddComponent: (e: React.SyntheticEvent, newValue:CardElement) => void,
        components: CardElement[]
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
  return (
    <div className={styles.CardToolbarDiv}>
        <Stack direction='horizontal' gap={3} style={{padding: 0, margin: 0, width: "100%", backgroundColor: "white"}}>
        <div style={{display: "table"}}>
        <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle", height:"50%"}}>
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
        </div>
        <div style={{display: "table"}}>
            <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
            <Button className={styles.DropdownButtonStyle}>
                <div style={{height:"2vh"}} onClick={(e) => {
                        onAddComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
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
                        onAddComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                }}>Square</Dropdown.Item>
                <Dropdown.Item eventKey="2" onClick={(e) => {
                    onAddComponent(e,  {ElementType: "SVG", Content: "", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                }}>Dots</Dropdown.Item>
                <Dropdown.Item eventKey="3" onClick={(e) => {
                    onAddComponent(e,  {ElementType: "Canvas", Content: "", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                }}>Draw</Dropdown.Item>
                <Dropdown.Item eventKey="4">Shapes Library</Dropdown.Item>
                </DropdownMenu>
            </Dropdown>
            </div>
        </div>
        <div style={{display: "table"}}>
            <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
            <Button onClick={() => {onSetIsShowingPaulyLibrary(!isShowingPaulyLibaray)}} className={styles.DropdownButtonStyle}>
                <div style={{height:"2vh"}}>
                    <img src={imageIcon} className={styles.imgContainer}/>
                </div>
            </Button>
            </div>
        </div>
        <div style={{display: "table"}}>
            <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
            <Button onClick={() => {onSetIsShowingCardsMenu(!isShowingCardsMenu)}} className={styles.DropdownButtonStyle}>
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
                    onSetSelectedDeviceMode(SelectedAspectType.Small)
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
                    onSetSelectedDeviceMode(SelectedAspectType.Medium)
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
                    onSetSelectedDeviceMode(SelectedAspectType.Large)
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
  )
}
