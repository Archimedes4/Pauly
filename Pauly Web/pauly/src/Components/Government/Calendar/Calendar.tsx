import React, {useEffect, useState} from 'react'
import ReactCalendar from 'react-calendar'
import "./CalendarCss.css"
import { UseAuth } from '../../../Contexts/AuthContext';
import { Link } from 'react-router-dom';
import { collection, doc, getDoc } from "firebase/firestore";

type schoolScheduelType = {
  Day: number,
  Month: number,
  SchoolDay?: string,
  Year: number,
  value?: number
}

export default function Calendar() {
  const { app, db, currentUser, currentUserMicrosoftAccessToken } = UseAuth()
  const [value, onChange] = useState(new Date());

  async function getEventsDay(Year: string, Month: string, Day: string) {
    const docRef = doc(db, "Calendar", Year, Month, Day);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("Year:", Year, "Month:", Month, "Day:", Day, "No such document!");
    }
  }

  useEffect(() => {
    console.log("This", value)
    if (value !== undefined){
      const year = value.getFullYear().toString();
      const month = value.getMonth() + 1; // months are zero-based, so adding 1
      const day = value.getDate();
      getEventsDay(year, month.toString(), day.toString())
    }
  }, [value])

  useEffect(() => {
    if (value !== undefined){

    }
  }, [value.getMonth(), value.getFullYear()])

  return (
    <div>
      <Link to="/government/">Back</Link>
      <h1 className='Title'>Calendar</h1>
      <ReactCalendar  calendarType="US" onClickDay={(e) => {onChange(e)}} value={value} />
      
    </div>
  )
}
