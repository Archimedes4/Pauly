import React, {useEffect, useState} from 'react'
import { Link } from "react-router-dom"
import {doc, getDoc} from "firebase/firestore"
import Progress from '../UI/ProgressView/Progress';
import { UseAuth } from '../Contexts/AuthContext';

export default function Home() {
  const {db} = UseAuth()
  const [headerMessage, setHeaderMessage] = useState<string>("")
  async function getInfo() {
    const infoDocRef = doc(db, "PaulyInfo", "Info")
    const infoDocSnap = await getDoc(infoDocRef)
    if (infoDocSnap.exists()){
      const data = infoDocSnap.data()
      console.log(data)
      setHeaderMessage(data["Message"])
    } else {
      console.log("Error")
      //TO DO handle error
    }
  }
  useEffect(() => {
    getInfo()
  }, [])
  return(
    <div style={{width: "100vw", height: "100vh", backgroundColor: "#793033"}}>
      <h1>{headerMessage}</h1>
      <div>
        <Link to="/government" style={{display: "block"}}> Government </Link>
        <Link to="/calendar" style={{display: "block"}}>Calendar</Link>
        <Link to="/profile" style={{display: "block"}}>Profile</Link>
        <Link to="/messaging" style={{display: "block"}}>Messaging</Link>
        <Link to="/quiz" style={{display: "block"}}>Quiz</Link>
      </div>
    </div>
  );
}