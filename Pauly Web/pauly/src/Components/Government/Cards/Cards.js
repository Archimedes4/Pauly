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
    const [components, setComponents] = useState([])
    const [zoomScale, setZoomScale] = useState(100)

    const value = {
        SelectedCard,
        SetSelectedCard,
        components,
        setComponents,
        zoomScale,
        setZoomScale
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