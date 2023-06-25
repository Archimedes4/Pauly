import React, {useState} from 'react'
import ReactCalendar from 'react-calendar'
import "./CalendarCss.css"
import { useAuth } from '../../../Contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Calendar() {
  const { app, db, currentUser, currentUserMicrosoftAccessToken } = useAuth()
  const [value, onChange] = useState(new Date());
  async function getEvents() {
    
  }
  return (
    <div>
      <Link to="/government/">Back</Link>
      Calendar
      <ReactCalendar onChange={(e: [Date, Date]) => {onChange(e[0])}} value={value} />
      
    </div>
  )
}
