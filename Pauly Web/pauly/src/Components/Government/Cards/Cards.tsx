import React, { useState, createContext, useContext} from 'react'
import { Route, Routes } from "react-router-dom"
import CardsHome from "./CardsHome"
import EditCardRouter from './EditCardRouter'
  
declare global{
    type PageType = {
        BindRef: string
        FirebaseID: number
        Use: String
    }
    interface PageContextType {
        SelectedPage: PageType,
        SetSelectedPage: React.Dispatch<React.SetStateAction<PageType>>,
        zoomScale: number,
        setZoomScale: React.Dispatch<React.SetStateAction<number>>,
        componentsSmall: CardElement[],
        setComponentsSmall: React.Dispatch<React.SetStateAction<CardElement[]>>,
        componentsMedium: CardElement[],
        setComponentsMedium: React.Dispatch<React.SetStateAction<CardElement[]>>,
        componentsLarge: CardElement[],
        setComponentsLarge: React.Dispatch<React.SetStateAction<CardElement[]>>
    }
}

const CardContext = createContext<PageContextType | null>(null);

export function useCardContext() {
    return useContext(CardContext)
}


export default function Cards() {
    const [SelectedPage, SetSelectedPage] = useState<PageType>(null)
    const [componentsSmall, setComponentsSmall] = useState<CardElement[]>([])
    const [componentsMedium, setComponentsMedium] = useState<CardElement[]>([])
    const [componentsLarge, setComponentsLarge] = useState<CardElement[]>([])
    const [zoomScale, setZoomScale] = useState<number>(100)

    const value: PageContextType = {
        SelectedPage,
        SetSelectedPage,
        zoomScale,
        setZoomScale,
        componentsSmall,
        setComponentsSmall,
        componentsMedium,
        setComponentsMedium,
        componentsLarge,
        setComponentsLarge
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