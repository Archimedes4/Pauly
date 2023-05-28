import React, {useState} from 'react'
import { Row, Container, Button, Dropdown, Stack } from 'react-bootstrap'
import styles from "./Cards.module.css"
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import Book from "../../../images/Books.png"
import {FaBold, FaItalic, FaUnderline, FaStrikethrough} from "react-icons/fa"

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

export default function Toolbar({onSetIsNavigateToDestinations, selectedElementValue, components, onSetComponents, onSetSelectedElement, onSetBolded, onSetItalic, onSetUnderlined, onSetStrikethrough,
    bolded, italic, underlined, strikethrough, isShowingBindPage, onSetIsShowingBindPage, onSetFontSize,
    fontSize, fontStyle, onSetSelectedFont
}:{
    onSetIsNavigateToDestinations?: (item: boolean) => void, 
    selectedElementValue: CardElement, 
    components: CardElement[],
    onSetComponents: (item: CardElement[]) => void,
    onSetSelectedElement: (item: CardElement) => void,
    bolded: boolean,
    onSetBolded: (item:boolean) => void,
    italic: boolean,
    onSetItalic: (item:boolean) => void,
    underlined: boolean,
    onSetUnderlined: (item:boolean) => void,
    strikethrough: boolean,
    onSetStrikethrough: (item:boolean) => void,
    isShowingBindPage: boolean,
    onSetIsShowingBindPage: (item: boolean) => void,
    onSetFontSize: (item: string) => void,
    onSetSelectedFont: (item: FontType) => void,
    fontSize: string,
    fontStyle: string
    }) {
    const [fontList, setFontList] = useState<FontType []>([])
    const avaliableFontSizes: string[] = ["8px", "12px", "14px", "16px", "20px", "24px"]
    const [showingFontSelectedMenu, setShowingFontSelectionMenu] = useState<boolean>(false)

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
                            }} className={bolded ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
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
                                <button className={styles.FontSelectionButton} onClick={() => {onSetSelectedFont(font)}}>{font.fontName}</button>
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
                    <Row>
                    <p>Undo</p>
                    </Row>
                </Container>: 
                <Container style={{backgroundColor: '#444444', height: "100%", width: "100%", margin: 0, padding: 0}}>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <p style={{fontSize: "12px", padding: 0, margin: 0, marginTop: "5%"}}>Connect Your Page</p>
                    </div>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <img src={Book} alt='Book' style={{width: "80%"}}/>
                    </div>
                    <div  style={{display: "flex", justifyContent: "center"}}>
                        <button onClick={() => {onSetIsShowingBindPage(!isShowingBindPage)}} className={styles.BindingButton}>
                        Bind
                        </button>
                    </div>
                </Container>
            }
        </div>
    )
}