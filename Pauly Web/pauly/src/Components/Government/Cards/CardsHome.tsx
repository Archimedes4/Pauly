import React, { useState, useEffect, useRef } from 'react'
import { doc, collection, getDoc, getDocs, getFirestore, runTransaction } from "firebase/firestore";
import { useAuth } from '../../../Contexts/AuthContext';
import { useCardContext } from "./Cards.js"
import { Navigate, Link } from "react-router-dom"
import styles from "./Cards.module.css"
import { Stack } from 'react-bootstrap';
import {IoIosArrowBack} from "react-icons/io"

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
      setCards(docSnap.data() as any)
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
        const querySnapshot = await getDocs(collection(db, "Pages"));
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots.data()
          if (doc.data().Count == undefined) {
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

  function setSelectedCard(e: React.SyntheticEvent, item: any){
    e.preventDefault()
    console.log(item)
    SetSelectedCard(item)
    SetNavigateToEdit(true)
  }

  if (NavigateToEdit === true) {
    return <Navigate to="/government/cards/edit"/>
  }

  async function createNewPage() {
    const docRef = doc(db, "Pages", "PagesCount")
    try {
      await runTransaction(db, async (transaction) => {
        const countDoc = await transaction.get(docRef);
        if (!countDoc.exists()) {
          throw "Document does not exist!";
        }
    
        const newID: number = countDoc.data().Count + 1
        transaction.set(doc(db, "Pages", newID.toString()), {FirebaseID: newID, Use: "Test", BindRef: ""})
        transaction.update(docRef, {Count: newID})
      });
      console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
    } 
  }

  return (
    <div className={styles.DivBackground}>
      <div>
        <Link to="/government" style={{textDecoration: "none"}}>
          <div className={styles.editCardBackButtonInnerContainer}>
            <Stack direction='horizontal'>
              <IoIosArrowBack color='white'/>
              <p className={styles.EditCardBackButton}>Back</p>
            </Stack>
          </div>
        </Link>
      </div>
      <h1 className={styles.Title}> Cards </h1>
      <div>  
        {
          Cards.map(item => (
            <div key={item.FirebaseID} className={styles.LinkContainer} style={(item.Use === "") ? {backgroundColor: "red"}:{}}>
                <button onClick={(e) => setSelectedCard(e, item)} style={{border: "none", background: "none"}} > 
                  <p className={styles.Link} style={(item.Use === "") ? {backgroundColor: "red"}:{}}>{(item.Use === "" ) ? "This Card Does Not Have a Use": item.Use }</p>
                </button>
            </div>
          ))
        }
        <button onClick={() =>  {     
          createNewPage()    
        }}>
          Create New
        </button>
      </div>
    </div>
  )
}
