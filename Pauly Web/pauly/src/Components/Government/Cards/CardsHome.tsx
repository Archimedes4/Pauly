import React, { useState, useEffect, useRef } from 'react'
import { doc, collection, getDoc, getDocs, getFirestore, runTransaction } from "firebase/firestore";
import { UseAuth } from '../../../Contexts/AuthContext';
import { useCardContext } from "./Cards"
import { Navigate, Link } from "react-router-dom"
import styles from "./Cards.module.css"
import { Stack } from 'react-bootstrap';
import {IoIosArrowBack} from "react-icons/io"
import create_UUID from "../../../Functions/CreateUUID"

export default function CardsHome() { 
  const { currentUser, currentUserMicrosoftAccessToken } = UseAuth()
  const [Cards, setCards] = useState<PageType[]>([])
  const { app, db } = UseAuth()
  const { setSelectedPage } = useCardContext()

  // async function getUserData() {
  //   const docRef = doc(db, "Users/", currentUser.uid);
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     console.log("Document data:", docSnap.data());
  //     setCards(docSnap.data() as any)
  //   } else {
  //     // docSnap.data() will be undefined in this case
  //     console.log("No such document!");
  //   }
  // }

  const [gotCardData, setGotCardData] = useState(false)

  async function getCardData() {
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "Pages"));
    var newPages: PageType[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots.data()
      if (doc.data().Count == undefined) {
        const data = doc.data()
        console.log(data)
        newPages.push(
          {
            bindRef: data["BindRef"],
            firebaseID: data["FirebaseID"],
            use: data["Use"],
            deviceModes: data["DeviceModes"],
            backgroundColor: data["BackgroundColor"]
          }
        )
      }
    });
    console.log(newPages)
    setCards(newPages)
  }

  useEffect(() => {
    if (gotCardData === false){
      getCardData()
      setGotCardData(true)
    }
  }, [currentUser.uid, gotCardData])

  const [navigateToEdit, setNavigateToEdit] = useState(false)

  function setSelectedCard(e: React.SyntheticEvent, item: PageType){
    e.preventDefault()
    console.log(item)
    setSelectedPage(item)
    setNavigateToEdit(true)
  }

  if (navigateToEdit === true) {
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
        transaction.set(doc(db, "Pages", newID.toString()), {FirebaseID: newID, Use: "Test", BackgroundColor: "#793033", BindRef: "", DeviceModes: [{aspectRatio: {Width: 16,Height: 9}, name: "Computer", id: create_UUID(), logo: "computer", order: 0}, {aspectRatio: {Width: 5,Height: 19}, name: "Phone", id: create_UUID(), logo: "phone", order: 1}]})
        transaction.update(docRef, {Count: newID})
      });
      console.log("Transaction successfully committed!");
      getCardData()
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
            <div key={item.firebaseID} className={styles.LinkContainer} style={(item.use === "") ? {backgroundColor: "red"}:{}}>
                <button onClick={(e) => setSelectedCard(e, item)} style={{border: "none", background: "none"}} > 
                  <p className={styles.Link} style={(item.use === "") ? {backgroundColor: "red"}:{}}>{(item.use === "" ) ? "This Card Does Not Have a Use": item.use }</p>
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
