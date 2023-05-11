import React from 'react'
import EditCard from './EditCard.tsx'
import Destinations from './Destinations'
import { Route, Routes } from "react-router-dom"

export default function EditCardRouter() {
  return (
    <div>
        <Routes>
            <Route exact path='/' element={<EditCard />}/>
            <Route path='/destinations' element={<Destinations />}/>
        </Routes>
    </div>
  )
}
