import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MessagingHome from "./MessagingHome"
import GymBro from "./GymBro"
import MessageLego from "./MessageLego"
import Tutoring from "./Tutoring"
import ReportBug from "./ReportBug"
import Message from "./Message"

export default function Messaging() {
  return (
    <div>
      <Routes>
        <Route exact path='/' element={<MessagingHome />} />
        <Route path='/gymbro' element={<GymBro />} />
        <Route path='/messagelego' element={<MessageLego />} />
        <Route path='/tutoring' element={<Tutoring />} />
        <Route path='/reportbug' element={<ReportBug />} />
        <Route path='/message' element={<Message />} />
      </Routes>
    </div>
  )
}
