import React from 'react'
import { Link, useNavigate } from "react-router-dom"
import { UseAuth } from '../../Contexts/AuthContext'
import { Stack } from 'react-bootstrap'

export default function GovernmentHome() {
    const { currentUser, currentUserMicrosoftAccessToken } = UseAuth()
    return (
    <div>
        <Link to="/">Back</Link>
        <p>Government</p>
        <p> {currentUser.email} </p>
        <p> {currentUserMicrosoftAccessToken} </p>
        <Stack>
            <Link to="/government/calendar">Calendar</Link>
            <Link to="/government/cards">Cards</Link>
            <Link to="/government/classes">Class</Link>
            <Link to='/government/commissions'>Commissions</Link>
            <Link to='/government/elections'>Elections</Link>
            <Link to='/government/president'>President</Link>
            <Link to='/government/resources'>Resources</Link>
            <Link to='/government/sports'>Sports</Link>
            <Link to='/government/users'>Users</Link> 
        </Stack>
    </div>
    )
}