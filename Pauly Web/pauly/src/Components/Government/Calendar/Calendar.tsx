import React, {useState} from 'react'
import ReactCalendar from 'react-calendar'
import "./CalendarCss.css"
import { useAuth } from '../../../Contexts/AuthContext';

export default function Calendar() {
  const { app, db, currentUser, currentUserMicrosoftAccessToken } = useAuth()
  const [value, onChange] = useState(new Date());
  async function getEvents() {
    
  }
  return (
    <div>
      Calendar
      <ReactCalendar onChange={(e: [Date, Date]) => {onChange(e[0])}} value={value} />
      
    </div>
  )
}
