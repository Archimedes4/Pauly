import React from 'react'
import Calendar from "./Government/Calendar/Calendar"
import Cards from "./Government/Cards/Cards"
import Class from './Government/Class'
import Commissions from "./Government/Commissions"
import Elections from "./Government/Elections"
import President from "./Government/President.tsx"
import Resources from "./Government/Resources.tsx"
import Sports from "./Government/Sports"
import GovernmentHome from './Government/GovernmentHome'
import Users from "./Government/Users"
import { Route, Routes } from "react-router-dom"

export default function Government() {
    return (
        <div>
            <Routes>
                <Route exact path='/' element={<GovernmentHome />}/>
                <Route path='/calendar' element={<Calendar />} />
                <Route path='/cards/*' element={<Cards />} />
                <Route path='/classes'element={<Class />}/>
                <Route path='/commissions' element={<Commissions />} />
                <Route path='/elections' element={<Elections />} />
                <Route path='/president' element={<President />} />
                <Route path='/resources' element={<Resources />} />
                <Route path='/sports' element={<Sports />} />
                <Route path='/users' element={<Users />} />
            </Routes>
        </div>
    )
}
