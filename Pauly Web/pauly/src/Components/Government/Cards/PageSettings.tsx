import React, { useEffect, useState } from 'react'
import { Card, Form, Stack } from 'react-bootstrap'
import styles from "./Cards.module.css"

enum SelectedSettingsModeType{
    Gerneral,
    Members,
    Discription
}

export default function PageSettings({selectedPage}:{selectedPage: PageType}) {
    const [selectedSettingsMode, setSelectedSettingsMode] = useState<SelectedSettingsModeType>(SelectedSettingsModeType.Discription)
    const [selectedPageBackgroundColor, setSelectedPageBackgroundColor] =  useState<string>("")
    useEffect(() => {
        setSelectedPageBackgroundColor(selectedPage.backgroundColor)
    }, [selectedPage])
    return (
        <div className={styles.EditCardTopView}>
            <Card className={styles.settingsCard}>
                <Card.Body>
                    <Stack direction='horizontal'>
                    { (selectedSettingsMode === SelectedSettingsModeType.Members) ? 
                        <div>Members</div>:null
                    }
                    { (selectedSettingsMode === SelectedSettingsModeType.Gerneral) ? 
                        <div>
                        General
                        <p>Background Color</p>
                        <input type="color" id="colorpicker" value={selectedPageBackgroundColor} onChange={changeEvent => {
                            setSelectedPageBackgroundColor(changeEvent.target.value)
                        }} />
                        </div>:null
                    }
                    { (selectedSettingsMode === SelectedSettingsModeType.Discription) ? 
                        <Stack>
                        <p> Edit Use </p>
                        <p> Current Use: {selectedPage.use}</p>
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
    )
}


// <input type="color" id="colorpicker" value={rgbaToHex(selectedTextColor)} onChange={changeEvent => {
//     const RgbResult = hexToRgb(changeEvent.target.value)
//     onSetSelectedTextColor(`rgba(${RgbResult.r}, ${RgbResult.g}, ${RgbResult.b}, ${opacity})`)
// }} />