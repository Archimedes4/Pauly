import React, { useState, createContext, useContext} from 'react'
import { Route, Routes } from "react-router-dom"
import CardsHome from "./CardsHome"
import EditCardRouter from './EditCardRouter'
  
declare global{
    type PageType = {
        bindRef: string
        firebaseID: number
        use: String
        deviceModes: deviceModeType[]
        defaultDeviceMode?: string //The UUID of the default device mode if the value is undefined it will pick the first one downloaded. Which is probablt the first one alphabetically
    }
    interface PageContextType {
        selectedPage: PageType,
        setSelectedPage: React.Dispatch<React.SetStateAction<PageType>>,
        zoomScale: number,
        setZoomScale: React.Dispatch<React.SetStateAction<number>>,
        components: CardElement[],
        setComponents: React.Dispatch<React.SetStateAction<CardElement[]>>,
    }
}

const CardContext = createContext<PageContextType | null>(null);

export function useCardContext() {
    return useContext(CardContext)
}


export default function Cards() {
    const [selectedPage, setSelectedPage] = useState<PageType>(null)
    const [components, setComponents] = useState<CardElement[]>([])
    const [zoomScale, setZoomScale] = useState<number>(100)

    const value: PageContextType = {
        selectedPage,
        setSelectedPage,
        zoomScale,
        setZoomScale,
        components,
        setComponents
    }

    return (
        <div>
            <CardContext.Provider value={value}>
                <Routes>
                    <Route path='/' element={<CardsHome />}/>
                    <Route path='/edit/*' element={<EditCardRouter />}/>
                </Routes>
            </CardContext.Provider>
        </div>
    )
}