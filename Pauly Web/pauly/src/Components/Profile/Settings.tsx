import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {getAuth, signOut} from "firebase/auth"

export default function Settings() {
    const history = useNavigate()
    return (
        <div>
            <Link to="/profile/">
                Back
            </Link>
            <p>settings</p>
            <button onClick={() => {
                const auth = getAuth();
                signOut(auth).then(() => {
                // Sign-out successful.
                    history("/login")
                }).catch((error) => {
                // An error happened.
                });
            }}>
                sign out
            </button>
        </div>
    )
}
