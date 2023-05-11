import React, { useState, useEffect, useRef } from 'react'
import { doc, collection, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { useAuth } from '../../../Contexts/AuthContext';
import { useCardContext } from "./Cards.js"
import { Navigate } from "react-router-dom"
import styles from "./Cards.module.css"

export default function CardsHome() { 
  const { currentUser, currentUserMicrosoftAccessToken } = useAuth()
  const [Cards, setCards] = useState([])
  const { app, db } = useAuth()
  const { SetSelectedCard } = useCardContext()

  async function getUserData() {
    const docRef = doc(db, "Users/", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setCards(docSnap.data())
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  const gotCardData = useRef(false)

  useEffect(() => {
    if (gotCardData.current === false){
      console.log('ran')
      async function getCardData() {
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, "Cards"));
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots.data()
          if (doc.data().CardCount == undefined) {
            setCards(Cards => [...Cards, doc.data()])
            console.log("This is cards", Cards)
          }
        });
      }
      getCardData()
      gotCardData.current = true
    }
    console.log("This is cards", Cards)
  }, [currentUser.uid, gotCardData])

  const [NavigateToEdit, SetNavigateToEdit] = useState(false)

  function setSelectedCard(e, item){
    e.preventDefault()
    console.log(item)
    SetSelectedCard(item)
    SetNavigateToEdit(true)
  }

  if (NavigateToEdit === true) {
    return <Navigate to="/government/cards/edit"/>
  }

  return (
    <div className={styles.DivBackground}>
      <h1 className={styles.Title}> Cards </h1>
      <div>  
        {
          Cards.map(item => (
            <div key={item.FirebaseID}>
                <button onClick={(e) => setSelectedCard(e, item)} style={{border: "none", background: "none"}} > <p className={styles.Link}>{item.Use}</p> </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
