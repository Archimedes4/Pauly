import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ProfileHome from "./ProfileHome"
import Leaderboard from "./Leaderboard"
import Commissions from "./Commissions"
import Resources from "./Resources"
import Elections from "./Elections"
import Settings from "./Settings"

export default function Messaging() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<ProfileHome/>} />
        <Route path='/leaderboard' element={<Leaderboard/>} />
        <Route path='/commissions' element={<Commissions/>} />
        <Route path='/resources' element={<Resources/>} />
        <Route path='/elections' element={<Elections/>} />
        <Route path='/settings' element={<Settings/>} />
      </Routes>
    </div>
  )
}
