import React, {useContext, useState, useEffect} from 'react'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, OAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"
import { getFirestore } from 'firebase/firestore';

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

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [currentUserMicrosoftAccessToken, setCurrentUserMicrosoftAccessToken] = useState()

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
  function LoginMicrosoft(){
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('mail.read');
    provider.addScope('calendars.read');
    provider.addScope('Directory.Read.All')

    provider.setCustomParameters({
      tenant: 'd9ad3c89-6aed-4783-93ce-212b71ee98f3'
    });
    
    signInWithPopup(auth, provider)
      .then((result) => {
        // User is signed in.
        // IdP data available in result.additionalUserInfo.profile.
    
        // Get the OAuth access token and ID Token
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        setCurrentUserMicrosoftAccessToken(accessToken)
        })
      .catch((error) => {
        // Handle error.
      });
  }

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    onAuthStateChanged(auth,( user => {
      setCurrentUser(user)
    }))
  }, [])

  const value = {
    db,
    currentUser,
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
