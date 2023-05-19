import React, { useState, createContext, useContext} from 'react'
import { Route, Routes } from "react-router-dom"
import CardsHome from "./CardsHome"
import EditCardRouter from './EditCardRouter'

const CardContext = createContext();

export function useCardContext() {
    return useContext(CardContext)
}

export default function Cards() {
    const [SelectedCard, SetSelectedCard] = useState()
    const [componentsSmall, setComponentsSmall] = useState([])
    const [componentsMedium, setComponentsMedium] = useState([])
    const [componentsLarge, setComponentsLarge] = useState([])
    const [zoomScale, setZoomScale] = useState(100)

    const value = {
        SelectedCard,
        SetSelectedCard,
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
                    <Route exact path='/' element={<CardsHome />}/>
                    <Route path='/edit/*' element={<EditCardRouter />}/>
                </Routes>
            </CardContext.Provider>
        </div>
    )
}