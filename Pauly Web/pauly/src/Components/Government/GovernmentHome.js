import React from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../../Contexts/AuthContext'

export default function GovernmentHome() {
    const history = useNavigate()
    const { currentUser, currentUserMicrosoftAccessToken } = useAuth()
    return (
    <div>
        <p>Government</p>
        <p> {currentUser.email} </p>
        <p> {currentUserMicrosoftAccessToken} </p>
        <Link to="/government/calendar">Calendar</Link>
        <Link to="/government/cards">Cards</Link>
    </div>
    )
}