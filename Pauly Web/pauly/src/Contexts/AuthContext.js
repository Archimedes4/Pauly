import React, {useContext, useState, useEffect} from 'react'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, OAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"
import { getFirestore, getDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
})

const AuthContext = React.createContext()

const auth = getAuth(app);

const db = getFirestore(app);

export function UseAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [currentUserMicrosoftAccessToken, setCurrentUserMicrosoftAccessToken] = useState()
  const [currentUserInfo, setCurrentUserInfo] = useState()

  function LoginPassword(email, password){
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
  async function LoginMicrosoft(){
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('mail.read');
    provider.addScope('calendars.read');
    provider.addScope('Directory.Read.All');
    provider.addScope('Team.ReadBasic.All');
    provider.addScope('Channel.ReadBasic.All');

    provider.setCustomParameters({
      tenant: 'd9ad3c89-6aed-4783-93ce-212b71ee98f3'
    });
    try{
      const result = await signInWithPopup(auth, provider)
      const credential = OAuthProvider.credentialFromResult(result);
      console.log(credential)
      const accessToken = credential.accessToken;
      const idToken = credential.idToken;
      setCurrentUserMicrosoftAccessToken(accessToken)
      const docRef = doc(db, "Users", currentUser.uid)
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data()
        setCurrentUserInfo({FirstName: data["First Name"], LastName: data["Last Name"], Permissions: data["Permissions"], ClassMode: data["ClassMode"], ClassPerms: data["ClassPerms"], SportsMode: data["SportsMode"], SportsPerms: data["SportsPerms"]})
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
      console.log("Happening")
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    onAuthStateChanged(auth,( user => {
      setCurrentUser(user)
      console.log(user)
    }))
  }, [])

  const value = {
    db,
    currentUser,
    currentUserInfo,
    LoginPassword,
    LoginMicrosoft,
    currentUserMicrosoftAccessToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
