import React from 'react'
import { Link } from 'react-router-dom'

export default function MessagingHome() {
  return (
    <div>
        <Link style={{display: "block"}} to="/">Back</Link>
        MessagingHome
        <Link style={{display: "block"}} to="/messaging/gymbro">GymBro</Link>
        <Link style={{display: "block"}} to='/messagelego'>Message Lego</Link>
        <Link style={{display: "block"}} to='/tutoring'>Tutoring</Link>
        <Link style={{display: "block"}} to='/reportbug' >Report Bug</Link>
        <Link style={{display: "block"}} to='/message' >Message</Link>
    </div>
  )
}
